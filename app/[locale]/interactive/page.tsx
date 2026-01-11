'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const TOPICS = [
  'Greetings',
  'Food & Dining',
  'Shopping',
  'Travel',
  'Weather',
  'Hobbies',
  'Family',
  'Work',
  'Health',
  'Daily Life',
];

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Professional'];

export default function InteractivePage() {
  const t = useTranslations();
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      
      // Initialize Web Speech API
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'ko-KR';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setUserMessage(transcript);
          handleSendMessage(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const handleStartConversation = async () => {
    if (!selectedTopic || !selectedDifficulty) {
      alert('Please select a topic and difficulty');
      return;
    }

    try {
      const response = await fetch('/api/interactive/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          difficulty: selectedDifficulty,
        }),
      });

      const data = await response.json();
      if (data.message) {
        setSessionId(data.sessionId);
        setMessages([{ role: 'assistant', content: data.message }]);
        speakMessage(data.message);
      }
    } catch (error) {
      console.error('Start conversation error:', error);
    }
  };

  const speakMessage = (text: string) => {
    if (!synthRef.current) return;

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
      // After AI finishes speaking, start listening
      setTimeout(() => {
        startListening();
      }, 500);
    };

    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current || isSpeaking) return;

    setIsListening(true);
    recognitionRef.current.start();

    // Auto-stop after 5 seconds
    setTimeout(() => {
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
        
        // If no message was captured, prompt user
        if (!userMessage) {
          handleSendMessage('');
        }
      }
    }, 5000);
  };

  const handleSendMessage = async (message: string) => {
    if (!sessionId) return;

    if (message) {
      setMessages((prev) => [...prev, { role: 'user', content: message }]);
    }

    try {
      const response = await fetch('/api/interactive/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          message: message || 'Continue',
          sessionId,
        }),
      });

      const data = await response.json();
      if (data.message) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
        speakMessage(data.message);
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  if (!selectedTopic || !selectedDifficulty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Interactive Learning
          </h1>

          <Card className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Select Topic
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {TOPICS.map((topic) => (
                <Button
                  key={topic}
                  variant={selectedTopic === topic ? 'primary' : 'secondary'}
                  onClick={() => setSelectedTopic(topic)}
                  className="h-16 text-base"
                >
                  {topic}
                </Button>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Select Difficulty
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {DIFFICULTIES.map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={selectedDifficulty === difficulty ? 'primary' : 'secondary'}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className="h-16 text-lg"
                >
                  {difficulty}
                </Button>
              ))}
            </div>
          </Card>

          <div className="mt-6 text-center">
            <Button
              size="lg"
              onClick={handleStartConversation}
              disabled={!selectedTopic || !selectedDifficulty}
            >
              Start Conversation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedTopic} - {selectedDifficulty}
            </h2>
            <div className="mt-4 space-y-2">
              {isSpeaking && (
                <p className="text-lg text-blue-600 dark:text-blue-400">
                  🔊 AI is speaking...
                </p>
              )}
              {isListening && (
                <p className="text-lg text-green-600 dark:text-green-400">
                  🎤 Listening... (max 5 seconds)
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-100 dark:bg-blue-900 ml-auto max-w-[80%]'
                    : 'bg-gray-100 dark:bg-gray-700 mr-auto max-w-[80%]'
                }`}
              >
                <p className="text-base md:text-lg">{msg.content}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedTopic('');
                setSelectedDifficulty('');
                setSessionId(null);
                setMessages([]);
              }}
            >
              Change Topic
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
