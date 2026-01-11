/**
 * 기능 테스트 스크립트
 * 주요 기능들이 올바르게 작동하는지 테스트
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function testFunctionality() {
  console.log('Testing application functionality...\n');

  const errors: string[] = [];
  let testUser: any = null;
  let testAdmin: any = null;

  try {
    // 1. 사용자 생성 및 인증 테스트
    console.log('1. Testing user creation and authentication...');
    try {
      testUser = await prisma.user.create({
        data: {
          firstName: 'TestUser',
          level: 'Beginner',
        },
      });
      console.log(`   ✓ User created: ${testUser.id}`);

      // Session 생성
      const token = crypto.randomBytes(32).toString('hex');
      const session = await prisma.session.create({
        data: {
          userId: testUser.id,
          token,
          expiresAt: new Date(Date.now() + 86400000),
        },
      });
      console.log(`   ✓ Session created: ${session.id}`);

      // Session 조회
      const foundSession = await prisma.session.findUnique({
        where: { token },
      });
      if (foundSession) {
        console.log('   ✓ Session retrieval works');
      } else {
        errors.push('Session retrieval failed');
      }
    } catch (error: any) {
      errors.push(`User/Session test failed: ${error.message}`);
    }

    // 2. 게임 점수 저장 테스트
    console.log('\n2. Testing game score functionality...');
    try {
      if (testUser) {
        const gameScore = await prisma.gameScore.create({
          data: {
            userId: testUser.id,
            gameType: 'typing',
            level: 1,
            score: 100,
            wordsCompleted: 5,
          },
        });
        console.log(`   ✓ Game score created: ${gameScore.id}`);

        // 리더보드 조회
        const leaderboard = await prisma.gameScore.findMany({
          take: 10,
          orderBy: [{ level: 'desc' }, { score: 'desc' }],
          include: {
            user: {
              select: { firstName: true },
            },
          },
        });
        console.log(`   ✓ Leaderboard query works (${leaderboard.length} entries)`);
      }
    } catch (error: any) {
      errors.push(`Game score test failed: ${error.message}`);
    }

    // 3. 관리자 인증 테스트
    console.log('\n3. Testing admin authentication...');
    try {
      const adminPassword = 'testpassword123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      testAdmin = await prisma.adminUser.create({
        data: {
          username: 'testadmin',
          password: hashedPassword,
        },
      });
      console.log(`   ✓ Admin user created: ${testAdmin.id}`);

      // 비밀번호 검증
      const isValid = await bcrypt.compare(adminPassword, testAdmin.password);
      if (isValid) {
        console.log('   ✓ Password verification works');
      } else {
        errors.push('Password verification failed');
      }
    } catch (error: any) {
      errors.push(`Admin authentication test failed: ${error.message}`);
    }

    // 4. 커리큘럼 관리 테스트
    console.log('\n4. Testing curriculum management...');
    try {
      const curriculum = await prisma.curriculum.create({
        data: {
          title: 'Test Curriculum',
          topic: 'Test Topic',
          difficulty: 'Beginner',
          description: 'Test description',
          content: 'Test content',
          source: 'ai_generated',
        },
      });
      console.log(`   ✓ Curriculum created: ${curriculum.id}`);

      // 커리큘럼 조회
      const curricula = await prisma.curriculum.findMany({
        orderBy: { createdAt: 'desc' },
      });
      console.log(`   ✓ Curriculum query works (${curricula.length} entries)`);
    } catch (error: any) {
      errors.push(`Curriculum test failed: ${error.message}`);
    }

    // 5. 레벨 테스트 저장 테스트
    console.log('\n5. Testing level test functionality...');
    try {
      if (testUser) {
        const levelTest = await prisma.levelTest.create({
          data: {
            userId: testUser.id,
            questions: [
              { type: 'speaking', question: 'Test question' },
            ],
            answers: { 0: 'Test answer' },
            result: 'Beginner',
            score: 0.75,
          },
        });
        console.log(`   ✓ Level test created: ${levelTest.id}`);

        // 사용자 레벨 업데이트
        await prisma.user.update({
          where: { id: testUser.id },
          data: { level: levelTest.result },
        });
        console.log('   ✓ User level update works');
      }
    } catch (error: any) {
      errors.push(`Level test failed: ${error.message}`);
    }

    // 6. 대화형 세션 테스트
    console.log('\n6. Testing interactive session...');
    try {
      if (testUser) {
        const session = await prisma.interactiveSession.create({
          data: {
            userId: testUser.id,
            topic: 'Greetings',
            difficulty: 'Beginner',
            messages: [
              { role: 'user', content: '안녕하세요' },
              { role: 'assistant', content: '안녕하세요! 반갑습니다.' },
            ],
          },
        });
        console.log(`   ✓ Interactive session created: ${session.id}`);

        // 세션 업데이트
        const updatedMessages = [
          ...(session.messages as any[]),
          { role: 'user', content: '고마워요' },
        ];
        await prisma.interactiveSession.update({
          where: { id: session.id },
          data: { messages: updatedMessages },
        });
        console.log('   ✓ Interactive session update works');
      }
    } catch (error: any) {
      errors.push(`Interactive session test failed: ${error.message}`);
    }

    // 7. 관리자 설정 테스트
    console.log('\n7. Testing admin settings...');
    try {
      const setting = await prisma.adminSetting.upsert({
        where: { key: 'TEST_KEY' },
        update: { value: 'updated' },
        create: {
          key: 'TEST_KEY',
          value: 'test_value',
        },
      });
      console.log(`   ✓ Admin setting created/updated: ${setting.id}`);

      // 설정 조회
      const settings = await prisma.adminSetting.findMany();
      console.log(`   ✓ Settings query works (${settings.length} entries)`);
    } catch (error: any) {
      errors.push(`Admin settings test failed: ${error.message}`);
    }

    // 결과 출력
    console.log('\n' + '='.repeat(50));
    console.log('Functionality Test Results:');
    console.log('='.repeat(50));
    
    if (errors.length === 0) {
      console.log('✓ All functionality tests passed!');
    } else {
      console.log(`\n✗ Errors (${errors.length}):`);
      errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
    }

    return errors.length === 0 ? 0 : 1;
  } catch (error) {
    console.error('Test suite failed:', error);
    return 1;
  } finally {
    // Cleanup
    if (testUser) {
      await prisma.interactiveSession.deleteMany({ where: { userId: testUser.id } });
      await prisma.levelTest.deleteMany({ where: { userId: testUser.id } });
      await prisma.gameScore.deleteMany({ where: { userId: testUser.id } });
      await prisma.session.deleteMany({ where: { userId: testUser.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
    }
    if (testAdmin) {
      await prisma.adminUser.delete({ where: { id: testAdmin.id } });
    }
    await prisma.curriculum.deleteMany({ where: { title: 'Test Curriculum' } });
    await prisma.adminSetting.deleteMany({ where: { key: 'TEST_KEY' } });
    await prisma.$disconnect();
  }
}

testFunctionality().then((code) => process.exit(code));
