import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../db/client';

export type AIPrompt = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type AIResponse = {
  content: string;
  provider: 'openai' | 'gemini' | 'claude';
};

class AIClient {
  private openai: OpenAI | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private claude: Anthropic | null = null;
  private apiKeys: {
    openai?: string;
    gemini?: string;
    claude?: string;
  } = {};

  constructor() {
    this.initializeFromEnv();
  }

  private async initializeFromEnv() {
    // Initialize from environment variables
    if (process.env.OPENAI_API_KEY) {
      this.apiKeys.openai = process.env.OPENAI_API_KEY;
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    if (process.env.GOOGLE_GEMINI_API_KEY) {
      this.apiKeys.gemini = process.env.GOOGLE_GEMINI_API_KEY;
      this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.apiKeys.claude = process.env.ANTHROPIC_API_KEY;
      this.claude = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }

    // Also try to load from database settings
    await this.loadFromDatabase();
  }

  private async loadFromDatabase() {
    try {
      const settings = await prisma.adminSetting.findMany({
        where: {
          key: {
            in: ['OPENAI_API_KEY', 'GOOGLE_GEMINI_API_KEY', 'ANTHROPIC_API_KEY'],
          },
        },
      });

      for (const setting of settings) {
        if (setting.key === 'OPENAI_API_KEY' && setting.value && !this.apiKeys.openai) {
          this.apiKeys.openai = setting.value;
          this.openai = new OpenAI({ apiKey: setting.value });
        } else if (setting.key === 'GOOGLE_GEMINI_API_KEY' && setting.value && !this.apiKeys.gemini) {
          this.apiKeys.gemini = setting.value;
          this.gemini = new GoogleGenerativeAI(setting.value);
        } else if (setting.key === 'ANTHROPIC_API_KEY' && setting.value && !this.apiKeys.claude) {
          this.apiKeys.claude = setting.value;
          this.claude = new Anthropic({ apiKey: setting.value });
        }
      }
    } catch (error) {
      console.error('Failed to load API keys from database:', error);
    }
  }

  async refreshApiKeys() {
    await this.loadFromDatabase();
  }

  async generateText(
    prompt: string,
    systemPrompt?: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<AIResponse> {
    // Refresh API keys before generating
    await this.refreshApiKeys();

    const messages: AIPrompt[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    // Try OpenAI first
    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })) as any,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2000,
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          return { content, provider: 'openai' };
        }
      } catch (error) {
        console.error('OpenAI error:', error);
      }
    }

    // Fallback to Gemini
    if (this.gemini) {
      try {
        const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
        const fullPrompt = systemPrompt
          ? `${systemPrompt}\n\n${prompt}`
          : prompt;
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const content = response.text();

        if (content) {
          return { content, provider: 'gemini' };
        }
      } catch (error) {
        console.error('Gemini error:', error);
      }
    }

    // Fallback to Claude
    if (this.claude) {
      try {
        const message = await this.claude.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: options?.maxTokens ?? 2000,
          temperature: options?.temperature ?? 0.7,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        });

        const content = message.content[0];
        if (content.type === 'text' && content.text) {
          return { content: content.text, provider: 'claude' };
        }
      } catch (error) {
        console.error('Claude error:', error);
      }
    }

    throw new Error('All AI providers failed');
  }

  async generateStream(
    prompt: string,
    systemPrompt?: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    await this.refreshApiKeys();

    const messages: AIPrompt[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    // Try OpenAI first
    if (this.openai) {
      try {
        const stream = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })) as any,
          stream: true,
        });

        let fullContent = '';
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            onChunk?.(content);
          }
        }
        return fullContent;
      } catch (error) {
        console.error('OpenAI stream error:', error);
      }
    }

    // Fallback to non-streaming for other providers
    const response = await this.generateText(prompt, systemPrompt);
    return response.content;
  }
}

// Singleton instance
let aiClientInstance: AIClient | null = null;

export function getAIClient(): AIClient {
  if (!aiClientInstance) {
    aiClientInstance = new AIClient();
  }
  return aiClientInstance;
}
