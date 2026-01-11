import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const gameType = searchParams.get('gameType') || 'typing';

    if (!gameType) {
      return NextResponse.json(
        { error: 'Missing gameType parameter' },
        { status: 400 }
      );
    }

    const latestScore = await prisma.gameScore.findFirst({
      where: {
        userId: user.id,
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
