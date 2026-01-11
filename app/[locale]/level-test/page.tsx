'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Question {
  type: string;
  question: string;
  hint?: string;
}

export default function LevelTestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadTest();
  }, []);

  const loadTest = async () => {
    try {
      const response = await fetch('/api/level-test');
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Load test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/level-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions, answers }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
      }
    } catch (error) {
      console.error('Submit test error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading test...</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <Card className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Test Results
            </h1>
            <div className="text-6xl mb-4">
              {result.result === 'Professional' ? '🏆' : result.result === 'Intermediate' ? '⭐' : '📚'}
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              Your Level: {result.result}
            </p>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              Score: {(result.score * 100).toFixed(1)}%
            </p>
            {result.feedback && (
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                {result.feedback}
              </p>
            )}
            <Button onClick={() => router.push('/en/dashboard')}>
              Go to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Korean Language Level Test
          </h1>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-xl md:text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Question {idx + 1} ({q.type})
                </h3>
                <p className="text-lg md:text-xl mb-4 text-gray-700 dark:text-gray-300">
                  {q.question}
                </p>
                {q.hint && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                    Hint: {q.hint}
                  </p>
                )}
                <Input
                  value={answers[idx] || ''}
                  onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                  placeholder="Your answer"
                  className="text-lg"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length < questions.length}
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
