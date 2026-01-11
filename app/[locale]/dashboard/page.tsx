'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Leaderboard } from '@/components/Leaderboard/Leaderboard';

interface User {
  id: string;
  firstName: string;
  level: string;
}

export default function DashboardPage() {
  const t = useTranslations();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'en';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.user) {
        router.push(`/${locale}/login`);
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push(`/${locale}/login`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push(`/${locale}/login`);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">{t('common.loading')}</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {t('dashboard.title')}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                {t('common.welcome')}, {user.firstName}! ({user.level})
              </p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              {t('common.logout')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Leaderboard */}
        <section className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('dashboard.leaderboard')}
          </h2>
          <Leaderboard />
        </section>

        {/* Main Features */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:scale-105 transition-transform">
            <Link href={`/${locale}/interactive`}>
              <div className="text-center">
                <div className="text-6xl mb-4">🗣️</div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('dashboard.interactiveLearning')}
                </h3>
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
                  Practice Korean conversation with AI
                </p>
              </div>
            </Link>
          </Card>

          <Card className="hover:scale-105 transition-transform">
            <Link href={`/${locale}/games`}>
              <div className="text-center">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('dashboard.games')}
                </h3>
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
                  Learn through fun games
                </p>
              </div>
            </Link>
          </Card>

          <Card className="hover:scale-105 transition-transform">
            <Link href={`/${locale}/level-test`}>
              <div className="text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('dashboard.levelTest')}
                </h3>
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
                  Test your Korean level
                </p>
              </div>
            </Link>
          </Card>
        </section>
      </main>
    </div>
  );
}
