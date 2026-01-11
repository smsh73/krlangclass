import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameType, level, score, wordsCompleted } = await request.json();

    if (!gameType || !level || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate gameType
    if (gameType !== 'typing' && gameType !== 'speaking') {
      return NextResponse.json(
        { error: 'Invalid gameType. Must be "typing" or "speaking"' },
        { status: 400 }
      );
    }

    // Validate level range
    if (level < 1 || level > 10) {
      return NextResponse.json(
        { error: 'Level must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Validate score
    if (score < 0) {
      return NextResponse.json(
        { error: 'Score must be non-negative' },
        { status: 400 }
      );
    }

    const gameScore = await prisma.gameScore.create({
      data: {
        userId: user.id,
        gameType,
        level,
        score,
        wordsCompleted: wordsCompleted || 0,
      },
    });

    return NextResponse.json({
      success: true,
      score: gameScore,
    });
  } catch (error) {
    console.error('Save score error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
