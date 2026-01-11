'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Leaderboard } from '@/components/Leaderboard/Leaderboard';

export default function GamesPage() {
  const t = useTranslations();
  const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'en';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          {t('dashboard.games')}
        </h1>

        {/* Leaderboard */}
        <section className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('dashboard.leaderboard')}
          </h2>
          <Leaderboard />
        </section>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="hover:scale-105 transition-transform">
            <Link href={`/${locale}/games/typing`}>
              <div className="text-center">
                <div className="text-6xl mb-4">⌨️</div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('games.typing')}
                </h3>
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
                  Practice typing Korean words
                </p>
              </div>
            </Link>
          </Card>

          <Card className="hover:scale-105 transition-transform">
            <Link href={`/${locale}/games/speaking`}>
              <div className="text-center">
                <div className="text-6xl mb-4">🎤</div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('games.speaking')}
                </h3>
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
                  Practice speaking Korean words
                </p>
              </div>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
