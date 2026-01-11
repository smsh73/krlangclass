'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Curriculum {
  id: string;
  title: string;
  topic: string | null;
  difficulty: string | null;
  description: string | null;
  source: string;
  createdAt: string;
}

export function CurriculumList() {
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurricula();
  }, []);

  const loadCurricula = async () => {
    try {
      const response = await fetch('/api/admin/curriculum');
      const data = await response.json();
      setCurricula(data.curricula || []);
    } catch (error) {
      console.error('Load curricula error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this curriculum?')) {
      return;
    }

    try {
      await fetch(`/api/admin/curriculum/${id}`, {
        method: 'DELETE',
      });
      loadCurricula();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (loading) {
    return <Card><p>Loading...</p></Card>;
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Curriculum List
      </h2>
      {curricula.length === 0 ? (
        <p className="text-lg text-gray-600 dark:text-gray-400">
          No curricula found. Create one using "Generate Curriculum" or "Upload Document".
        </p>
      ) : (
        <div className="space-y-4">
          {curricula.map((curriculum) => (
            <div
              key={curriculum.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {curriculum.title}
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {curriculum.topic && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                    {curriculum.topic}
                  </span>
                )}
                {curriculum.difficulty && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                    {curriculum.difficulty}
                  </span>
                )}
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                  {curriculum.source}
                </span>
              </div>
              {curriculum.description && (
                <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
                  {curriculum.description}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                Created: {new Date(curriculum.createdAt).toLocaleDateString()}
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(curriculum.id)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
