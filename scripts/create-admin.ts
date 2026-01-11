/**
 * Script to create initial admin user
 * Run with: npx tsx scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

async function createAdmin() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, resolve);
    });
  };

  try {
    console.log('Creating admin user...\n');

    const username = await question('Enter username: ');
    if (!username.trim()) {
      console.error('Username is required');
      process.exit(1);
    }

    // Check if username already exists
    const existing = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (existing) {
      console.error('Username already exists');
      process.exit(1);
    }

    const password = await question('Enter password: ');
    if (!password.trim()) {
      console.error('Password is required');
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.adminUser.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    console.log(`\n✓ Admin user created successfully!`);
    console.log(`  Username: ${admin.username}`);
    console.log(`  ID: ${admin.id}`);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdmin();
