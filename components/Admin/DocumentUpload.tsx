'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/curriculum', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.curriculum);
        alert('Document uploaded and curriculum created!');
        setFile(null);
      } else {
        alert('Failed to upload document');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Upload Document
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
            Select Document (DOCX or PDF)
          </label>
          <input
            type="file"
            accept=".docx,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
            onChange={handleFileChange}
            className="w-full text-base"
          />
        </div>
        {file && (
          <p className="text-base text-gray-600 dark:text-gray-400">
            Selected: {file.name}
          </p>
        )}
        <Button
          size="lg"
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? 'Uploading...' : 'Upload and Generate Curriculum'}
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
