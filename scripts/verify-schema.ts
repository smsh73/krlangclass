/**
 * Script to verify database schema consistency
 * Run with: npx tsx scripts/verify-schema.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySchema() {
  try {
    console.log('Verifying database schema...\n');

    // Test User model
    const userCount = await prisma.user.count();
    console.log(`✓ User model: ${userCount} records`);

    // Test Session model
    const sessionCount = await prisma.session.count();
    console.log(`✓ Session model: ${sessionCount} records`);

    // Test Curriculum model
    const curriculumCount = await prisma.curriculum.count();
    console.log(`✓ Curriculum model: ${curriculumCount} records`);

    // Test CurriculumDocument model
    const documentCount = await prisma.curriculumDocument.count();
    console.log(`✓ CurriculumDocument model: ${documentCount} records`);

    // Test InteractiveSession model
    const interactiveCount = await prisma.interactiveSession.count();
    console.log(`✓ InteractiveSession model: ${interactiveCount} records`);

    // Test GameScore model
    const gameScoreCount = await prisma.gameScore.count();
    console.log(`✓ GameScore model: ${gameScoreCount} records`);

    // Test LevelTest model
    const levelTestCount = await prisma.levelTest.count();
    console.log(`✓ LevelTest model: ${levelTestCount} records`);

    // Test AdminUser model
    const adminCount = await prisma.adminUser.count();
    console.log(`✓ AdminUser model: ${adminCount} records`);

    // Test AdminSetting model
    const settingCount = await prisma.adminSetting.count();
    console.log(`✓ AdminSetting model: ${settingCount} records`);

    // Test AdminAccessLog model
    const logCount = await prisma.adminAccessLog.count();
    console.log(`✓ AdminAccessLog model: ${logCount} records`);

    console.log('\n✓ All schema models verified successfully!');
  } catch (error) {
    console.error('✗ Schema verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifySchema();
