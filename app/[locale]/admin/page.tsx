'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CurriculumGenerator } from '@/components/Admin/CurriculumGenerator';
import { DocumentUpload } from '@/components/Admin/DocumentUpload';
import { CurriculumList } from '@/components/Admin/CurriculumList';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'generate' | 'upload' | 'settings'>('curriculum');
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    gemini: '',
    claude: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (data.settings) {
        setApiKeys({
          openai: data.settings.OPENAI_API_KEY || '',
          gemini: data.settings.GOOGLE_GEMINI_API_KEY || '',
          claude: data.settings.ANTHROPIC_API_KEY || '',
        });
      }
    } catch (error) {
      console.error('Load settings error:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          OPENAI_API_KEY: apiKeys.openai,
          GOOGLE_GEMINI_API_KEY: apiKeys.gemini,
          ANTHROPIC_API_KEY: apiKeys.claude,
        }),
      });
      alert('Settings saved');
    } catch (error) {
      console.error('Save settings error:', error);
      alert('Failed to save settings');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Admin Panel
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <Button
            variant={activeTab === 'curriculum' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('curriculum')}
          >
            Curriculum List
          </Button>
          <Button
            variant={activeTab === 'generate' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('generate')}
          >
            Generate Curriculum
          </Button>
          <Button
            variant={activeTab === 'upload' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('upload')}
          >
            Upload Document
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('settings')}
          >
            API Keys
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'curriculum' && <CurriculumList />}
        {activeTab === 'generate' && <CurriculumGenerator />}
        {activeTab === 'upload' && <DocumentUpload />}
        {activeTab === 'settings' && (
          <Card>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              API Keys
            </h2>
            <div className="space-y-4">
              <Input
                label="OpenAI API Key"
                type="password"
                value={apiKeys.openai}
                onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                placeholder="sk-..."
              />
              <Input
                label="Google Gemini API Key"
                type="password"
                value={apiKeys.gemini}
                onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                placeholder="AIza..."
              />
              <Input
                label="Anthropic Claude API Key"
                type="password"
                value={apiKeys.claude}
                onChange={(e) => setApiKeys({ ...apiKeys, claude: e.target.value })}
                placeholder="sk-ant-..."
              />
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
