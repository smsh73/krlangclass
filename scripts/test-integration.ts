/**
 * 통합 테스트 스크립트
 * 전체 시스템의 정합성 테스트
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function testIntegration() {
  console.log('Running integration tests...\n');

  const errors: string[] = [];
  const testData: any = {};

  try {
    // 1. 전체 워크플로우 테스트: 사용자 등록 → 게임 플레이 → 리더보드
    console.log('1. Testing complete user workflow...');
    try {
      // 사용자 생성
      const user = await prisma.user.create({
        data: {
          firstName: 'IntegrationTest',
          level: 'Beginner',
        },
      });
      testData.userId = user.id;
      console.log(`   ✓ User created: ${user.firstName}`);

      // 세션 생성
      const token = crypto.randomBytes(32).toString('hex');
      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 86400000),
        },
      });
      console.log('   ✓ Session created');

      // 게임 점수 저장
      for (let level = 1; level <= 3; level++) {
        await prisma.gameScore.create({
          data: {
            userId: user.id,
            gameType: 'typing',
            level,
            score: level * 100,
            wordsCompleted: 5,
          },
        });
      }
      console.log('   ✓ Game scores created');

      // 리더보드 조회
      const leaderboard = await prisma.gameScore.findMany({
        where: { userId: user.id },
        orderBy: [{ level: 'desc' }, { score: 'desc' }],
      });
      if (leaderboard.length === 3) {
        console.log('   ✓ Leaderboard query works');
      } else {
        errors.push('Leaderboard query returned incorrect count');
      }

      // 레벨 테스트
      const levelTest = await prisma.levelTest.create({
        data: {
          userId: user.id,
          questions: [{ type: 'speaking', question: 'Test' }],
          answers: { 0: 'Answer' },
          result: 'Intermediate',
          score: 0.8,
        },
      });
      console.log('   ✓ Level test created');

      // 사용자 레벨 업데이트
      await prisma.user.update({
        where: { id: user.id },
        data: { level: levelTest.result },
      });
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      if (updatedUser?.level === 'Intermediate') {
        console.log('   ✓ User level updated correctly');
      } else {
        errors.push('User level update failed');
      }
    } catch (error: any) {
      errors.push(`User workflow test failed: ${error.message}`);
    }

    // 2. 관리자 워크플로우 테스트
    console.log('\n2. Testing admin workflow...');
    try {
      // 관리자 생성
      const adminPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = await prisma.adminUser.create({
        data: {
          username: 'integration-admin',
          password: hashedPassword,
        },
      });
      testData.adminId = admin.id;
      console.log('   ✓ Admin user created');

      // 관리자 설정 저장
      await prisma.adminSetting.upsert({
        where: { key: 'TEST_SETTING' },
        update: { value: 'updated' },
        create: {
          key: 'TEST_SETTING',
          value: 'test',
        },
      });
      console.log('   ✓ Admin setting saved');

      // 접속 로그 기록
      await prisma.adminAccessLog.create({
        data: {
          adminId: admin.id,
          action: 'test_action',
          details: { test: true },
        },
      });
      console.log('   ✓ Admin access log created');

      // 커리큘럼 생성
      const curriculum = await prisma.curriculum.create({
        data: {
          title: 'Integration Test Curriculum',
          topic: 'Test',
          difficulty: 'Beginner',
          description: 'Test',
          content: 'Test content',
          source: 'ai_generated',
        },
      });
      testData.curriculumId = curriculum.id;
      console.log('   ✓ Curriculum created');
    } catch (error: any) {
      errors.push(`Admin workflow test failed: ${error.message}`);
    }

    // 3. 데이터 무결성 테스트
    console.log('\n3. Testing data integrity...');
    try {
      // Cascade 삭제 테스트
      if (testData.userId) {
        const sessionCount = await prisma.session.count({
          where: { userId: testData.userId },
        });
        const gameScoreCount = await prisma.gameScore.count({
          where: { userId: testData.userId },
        });

        await prisma.user.delete({
          where: { id: testData.userId },
        });

        // Cascade 삭제 확인
        const remainingSessions = await prisma.session.count({
          where: { userId: testData.userId },
        });
        const remainingScores = await prisma.gameScore.count({
          where: { userId: testData.userId },
        });

        if (remainingSessions === 0 && remainingScores === 0) {
          console.log('   ✓ Cascade delete works correctly');
        } else {
          errors.push('Cascade delete failed');
        }
      }
    } catch (error: any) {
      errors.push(`Data integrity test failed: ${error.message}`);
    }

    // 4. 동시성 테스트
    console.log('\n4. Testing concurrency...');
    try {
      const testUser = await prisma.user.create({
        data: {
          firstName: 'ConcurrencyTest',
          level: 'Beginner',
        },
      });

      // 동시에 여러 게임 점수 생성
      const promises = Array.from({ length: 5 }, (_, i) =>
        prisma.gameScore.create({
          data: {
            userId: testUser.id,
            gameType: 'typing',
            level: 1,
            score: i * 10,
            wordsCompleted: i,
          },
        })
      );

      await Promise.all(promises);
      console.log('   ✓ Concurrent operations work');

      const count = await prisma.gameScore.count({
        where: { userId: testUser.id },
      });
      if (count === 5) {
        console.log('   ✓ All concurrent operations completed');
      } else {
        errors.push('Concurrent operations incomplete');
      }

      // Cleanup
      await prisma.gameScore.deleteMany({
        where: { userId: testUser.id },
      });
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    } catch (error: any) {
      errors.push(`Concurrency test failed: ${error.message}`);
    }

    // 5. JSON 필드 검증
    console.log('\n5. Testing JSON field operations...');
    try {
      const testUser = await prisma.user.create({
        data: {
          firstName: 'JSONTest',
          level: 'Beginner',
        },
      });

      // 복잡한 JSON 구조 저장
      const complexMessages = [
        { role: 'user', content: '안녕', timestamp: Date.now() },
        { role: 'assistant', content: '안녕하세요!', timestamp: Date.now() },
        { role: 'user', content: '고마워', timestamp: Date.now() },
      ];

      const session = await prisma.interactiveSession.create({
        data: {
          userId: testUser.id,
          topic: 'Greetings',
          difficulty: 'Beginner',
          messages: complexMessages,
        },
      });

      // JSON 조회 및 검증
      const retrieved = await prisma.interactiveSession.findUnique({
        where: { id: session.id },
      });

      if (retrieved && Array.isArray(retrieved.messages)) {
        console.log('   ✓ Complex JSON structure saved and retrieved');
      } else {
        errors.push('JSON field retrieval failed');
      }

      // Cleanup
      await prisma.interactiveSession.deleteMany({
        where: { userId: testUser.id },
      });
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    } catch (error: any) {
      errors.push(`JSON field test failed: ${error.message}`);
    }

    // 결과 출력
    console.log('\n' + '='.repeat(50));
    console.log('Integration Test Results:');
    console.log('='.repeat(50));

    if (errors.length === 0) {
      console.log('✓ All integration tests passed!');
      return 0;
    } else {
      console.log(`\n✗ Errors (${errors.length}):`);
      errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
      return 1;
    }
  } catch (error) {
    console.error('Integration test suite failed:', error);
    return 1;
  } finally {
    // 최종 정리
    if (testData.userId) {
      await prisma.interactiveSession.deleteMany({ where: { userId: testData.userId } });
      await prisma.levelTest.deleteMany({ where: { userId: testData.userId } });
      await prisma.gameScore.deleteMany({ where: { userId: testData.userId } });
      await prisma.session.deleteMany({ where: { userId: testData.userId } });
      await prisma.user.deleteMany({ where: { id: testData.userId } });
    }
    if (testData.adminId) {
      await prisma.adminAccessLog.deleteMany({ where: { adminId: testData.adminId } });
      await prisma.adminUser.deleteMany({ where: { id: testData.adminId } });
    }
    if (testData.curriculumId) {
      await prisma.curriculum.delete({ where: { id: testData.curriculumId } });
    }
    await prisma.adminSetting.deleteMany({ where: { key: 'TEST_SETTING' } });
    await prisma.$disconnect();
  }
}

testIntegration().then((code) => process.exit(code));
