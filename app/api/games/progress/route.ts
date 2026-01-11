import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const gameType = searchParams.get('gameType');
    const userId = searchParams.get('userId');

    if (!gameType || !userId) {
      return NextResponse.json(
        { error: 'Missing parameters' },
        { status: 400 }
      );
    }

    const latestScore = await prisma.gameScore.findFirst({
      where: {
        userId,
        gameType,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    if (!latestScore) {
      return NextResponse.json({ level: 1 });
    }

    // If completed all words in level, next level
    const wordsForLevel = 5; // Each level has 5 words
    if (latestScore.wordsCompleted >= wordsForLevel) {
      return NextResponse.json({ level: Math.min(latestScore.level + 1, 10) });
    }

    return NextResponse.json({ level: latestScore.level });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
