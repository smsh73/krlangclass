import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET() {
  try {
    const scores = await prisma.gameScore.findMany({
      take: 20,
      orderBy: [
        { level: 'desc' },
        { score: 'desc' },
      ],
      include: {
        user: {
          select: {
            firstName: true,
          },
        },
      },
    });

    const entries = scores.map((score) => ({
      firstName: score.user.firstName,
      gameType: score.gameType,
      level: score.level,
      score: score.score,
    }));

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
