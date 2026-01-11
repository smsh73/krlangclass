import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { createSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const { firstName } = await request.json();

    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      return NextResponse.json(
        { error: 'First name is required' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        firstName: firstName.trim(),
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firstName: firstName.trim(),
          level: 'Beginner',
        },
      });
    }

    // Create session
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        level: user.level,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
