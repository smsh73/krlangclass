'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

interface LeaderboardEntry {
  firstName: string;
  gameType: string;
  level: number;
  score: number;
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/games/leaderboard');
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <p className="text-center text-lg">Loading leaderboard...</p>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400">
          No scores yet. Be the first to play!
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-lg font-bold text-gray-900 dark:text-white">
                Rank
              </th>
              <th className="text-left py-3 px-4 text-lg font-bold text-gray-900 dark:text-white">
                Name
              </th>
              <th className="text-left py-3 px-4 text-lg font-bold text-gray-900 dark:text-white">
                Game
              </th>
              <th className="text-left py-3 px-4 text-lg font-bold text-gray-900 dark:text-white">
                Level
              </th>
              <th className="text-left py-3 px-4 text-lg font-bold text-gray-900 dark:text-white">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="py-4 px-4 text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                  {index + 1}
                </td>
                <td className="py-4 px-4 text-base md:text-lg text-gray-900 dark:text-white">
                  {entry.firstName}
                </td>
                <td className="py-4 px-4 text-base md:text-lg text-gray-600 dark:text-gray-400 capitalize">
                  {entry.gameType}
                </td>
                <td className="py-4 px-4 text-base md:text-lg text-gray-600 dark:text-gray-400">
                  {entry.level}
                </td>
                <td className="py-4 px-4 text-base md:text-lg font-bold text-blue-600 dark:text-blue-400">
                  {entry.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
