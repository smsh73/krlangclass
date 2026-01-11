'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const WORDS_BY_LEVEL: Record<number, string[]> = {
  1: ['안녕', '감사', '사과', '물', '밥'],
  2: ['학교', '친구', '가족', '시간', '날씨'],
  3: ['여행', '음식', '운동', '음악', '책'],
  4: ['병원', '은행', '공원', '도서관', '식당'],
  5: ['컴퓨터', '인터넷', '스마트폰', '카메라', '텔레비전'],
  6: ['환경', '경제', '정치', '문화', '역사'],
  7: ['과학', '기술', '의학', '법률', '교육'],
  8: ['철학', '심리학', '사회학', '인류학', '언어학'],
  9: ['경영', '마케팅', '재무', '인사', '전략'],
  10: ['혁신', '창의성', '리더십', '협력', '성공'],
};

export default function TypingGamePage() {
  const router = useRouter();
  const [level, setLevel] = useState(1);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [crownEarned, setCrownEarned] = useState(false);

  const words = WORDS_BY_LEVEL[level] || [];
  const currentWord = words[currentWordIndex];

  useEffect(() => {
    checkUserProgress();
  }, []);

  const checkUserProgress = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.user) {
        // Check existing progress
        const progressResponse = await fetch(`/api/games/progress?gameType=typing&userId=${data.user.id}`);
        const progressData = await progressResponse.json();
        if (progressData.level) {
          setLevel(progressData.level);
        }
      }
    } catch (error) {
      console.error('Progress check error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (value === currentWord) {
      // Correct!
      setScore(score + 1);
      setInput('');

      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
      } else {
        // Level completed
        handleLevelComplete();
      }
    }
  };

  const handleLevelComplete = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (!data.user) {
        router.push('/en/login');
        return;
      }

      // Save score
      await fetch('/api/games/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'typing',
          level,
          score: score + 1,
          wordsCompleted: words.length,
        }),
      });

      if (level < 10) {
        // Next level
        setLevel(level + 1);
        setCurrentWordIndex(0);
        setScore(0);
        setInput('');
      } else {
        // All levels completed!
        setCompleted(true);
        setCrownEarned(true);
      }
    } catch (error) {
      console.error('Level complete error:', error);
    }
  };

  if (completed && crownEarned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="text-center max-w-md">
          <div className="text-8xl mb-4">👑</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Congratulations!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            You've completed all 10 levels!
          </p>
          <Button onClick={() => router.push('/en/games')}>
            Back to Games
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Typing Game
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Level {level} / 10
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-500 mt-2">
              Word {currentWordIndex + 1} of {words.length}
            </p>
          </div>

          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">
              {currentWord}
            </div>
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type the word above"
              className="text-center text-2xl"
              autoFocus
            />
          </div>

          <div className="text-center">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Score: {score} / {words.length}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
