/**
 * 스키마 불일치 테스트 스크립트
 * Prisma 스키마와 실제 코드 사용 간의 일관성을 검증
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface SchemaField {
  model: string;
  field: string;
  type: string;
  required: boolean;
}

async function testSchemaConsistency() {
  console.log('Testing schema consistency...\n');

  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // 1. 모든 모델이 접근 가능한지 테스트
    console.log('1. Testing model accessibility...');
    const models = [
      'User',
      'Session',
      'Curriculum',
      'CurriculumDocument',
      'InteractiveSession',
      'GameScore',
      'LevelTest',
      'AdminUser',
      'AdminSetting',
      'AdminAccessLog',
    ];

    for (const model of models) {
      try {
        // @ts-ignore - 동적 접근
        const count = await prisma[model.toLowerCase()].count();
        console.log(`   ✓ ${model} model accessible (${count} records)`);
      } catch (error: any) {
        errors.push(`Model ${model} is not accessible: ${error.message}`);
        console.log(`   ✗ ${model} model error: ${error.message}`);
      }
    }

    // 2. 필수 관계 테스트
    console.log('\n2. Testing relationships...');
    
    // User와 Session 관계
    try {
      const user = await prisma.user.findFirst();
      if (user) {
        const sessions = await prisma.session.findMany({
          where: { userId: user.id },
          take: 1,
        });
        console.log('   ✓ User-Session relationship works');
      }
    } catch (error: any) {
      errors.push(`User-Session relationship error: ${error.message}`);
    }

    // User와 GameScore 관계
    try {
      const user = await prisma.user.findFirst();
      if (user) {
        const scores = await prisma.gameScore.findMany({
          where: { userId: user.id },
          take: 1,
        });
        console.log('   ✓ User-GameScore relationship works');
      }
    } catch (error: any) {
      warnings.push(`User-GameScore relationship: ${error.message}`);
    }

    // Curriculum과 CurriculumDocument 관계
    try {
      const curriculum = await prisma.curriculum.findFirst({
        include: { document: true },
      });
      console.log('   ✓ Curriculum-Document relationship works');
    } catch (error: any) {
      warnings.push(`Curriculum-Document relationship: ${error.message}`);
    }

    // 3. 필수 필드 검증
    console.log('\n3. Testing required fields...');
    
    // User 필수 필드
    try {
      await prisma.user.create({
        data: {
          firstName: 'Test',
          level: 'Beginner',
        },
      });
      console.log('   ✓ User required fields validated');
      
      // Cleanup
      await prisma.user.deleteMany({
        where: { firstName: 'Test' },
      });
    } catch (error: any) {
      errors.push(`User required fields error: ${error.message}`);
    }

    // 4. 제약 조건 테스트
    console.log('\n4. Testing constraints...');
    
    // Session token uniqueness
    try {
      const user = await prisma.user.findFirst();
      if (user) {
        const token = 'test-token-' + Date.now();
        await prisma.session.create({
          data: {
            userId: user.id,
            token,
            expiresAt: new Date(Date.now() + 86400000),
          },
        });
        
        try {
          await prisma.session.create({
            data: {
              userId: user.id,
              token, // Duplicate
              expiresAt: new Date(Date.now() + 86400000),
            },
          });
          errors.push('Session token uniqueness constraint failed');
        } catch {
          console.log('   ✓ Session token uniqueness constraint works');
        }
        
        // Cleanup
        await prisma.session.deleteMany({
          where: { token },
        });
      }
    } catch (error: any) {
      warnings.push(`Session constraint test: ${error.message}`);
    }

    // AdminUser username uniqueness
    try {
      const username = 'test-admin-' + Date.now();
      await prisma.adminUser.create({
        data: {
          username,
          password: 'hashed',
        },
      });
      
      try {
        await prisma.adminUser.create({
          data: {
            username, // Duplicate
            password: 'hashed',
          },
        });
        errors.push('AdminUser username uniqueness constraint failed');
      } catch {
        console.log('   ✓ AdminUser username uniqueness constraint works');
      }
      
      // Cleanup
      await prisma.adminUser.deleteMany({
        where: { username },
      });
    } catch (error: any) {
      warnings.push(`AdminUser constraint test: ${error.message}`);
    }

    // 5. 데이터 타입 검증
    console.log('\n5. Testing data types...');
    
    // GameScore level 범위 (1-10)
    try {
      const user = await prisma.user.findFirst();
      if (user) {
        await prisma.gameScore.create({
          data: {
            userId: user.id,
            gameType: 'typing',
            level: 5,
            score: 100,
            wordsCompleted: 5,
          },
        });
        console.log('   ✓ GameScore data types validated');
        
        // Cleanup
        await prisma.gameScore.deleteMany({
          where: { userId: user.id, gameType: 'typing', level: 5 },
        });
      }
    } catch (error: any) {
      errors.push(`GameScore data type error: ${error.message}`);
    }

    // 6. JSON 필드 검증
    console.log('\n6. Testing JSON fields...');
    
    try {
      const user = await prisma.user.findFirst();
      if (user) {
        await prisma.interactiveSession.create({
          data: {
            userId: user.id,
            topic: 'test',
            difficulty: 'Beginner',
            messages: [
              { role: 'user', content: 'test' },
              { role: 'assistant', content: 'response' },
            ],
          },
        });
        console.log('   ✓ InteractiveSession JSON field works');
        
        // Cleanup
        await prisma.interactiveSession.deleteMany({
          where: { userId: user.id, topic: 'test' },
        });
      }
    } catch (error: any) {
      errors.push(`InteractiveSession JSON field error: ${error.message}`);
    }

    // 결과 출력
    console.log('\n' + '='.repeat(50));
    console.log('Test Results:');
    console.log('='.repeat(50));
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✓ All tests passed!');
      return 0;
    }
    
    if (warnings.length > 0) {
      console.log(`\n⚠ Warnings (${warnings.length}):`);
      warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
    }
    
    if (errors.length > 0) {
      console.log(`\n✗ Errors (${errors.length}):`);
      errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
      return 1;
    }
    
    return 0;
  } catch (error) {
    console.error('Test failed:', error);
    return 1;
  } finally {
    await prisma.$disconnect();
  }
}

testSchemaConsistency().then((code) => process.exit(code));
