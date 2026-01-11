'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function CurriculumGenerator() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!topic || !difficulty) {
      alert('Please fill in topic and difficulty');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/curriculum/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          difficulty,
          learningObjectives,
          description,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.curriculum);
        alert('Curriculum generated successfully!');
        setTopic('');
        setLearningObjectives('');
        setDescription('');
      } else {
        alert('Failed to generate curriculum');
      }
    } catch (error) {
      console.error('Generate error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Generate Curriculum with AI
      </h2>
      <div className="space-y-4">
        <Input
          label="Topic *"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Greetings, Food, Travel"
          required
        />
        <div>
          <label className="block text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
            Difficulty *
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full h-12 md:h-14 px-4 md:px-6 text-base md:text-lg border-2 rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Professional">Professional</option>
          </select>
        </div>
        <Input
          label="Learning Objectives (Optional)"
          value={learningObjectives}
          onChange={(e) => setLearningObjectives(e.target.value)}
          placeholder="What should students learn?"
        />
        <div>
          <label className="block text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional context..."
            className="w-full h-32 px-4 py-2 text-base border-2 rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={loading || !topic || !difficulty}
        >
          {loading ? 'Generating...' : 'Generate Curriculum'}
        </Button>
        {result && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <p className="text-lg font-semibold text-green-800 dark:text-green-200">
              Curriculum Created: {result.title}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
