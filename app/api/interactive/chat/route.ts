import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';
import { getAIClient } from '@/lib/ai/client';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, difficulty, message, sessionId } = await request.json();

    if (!topic || !difficulty) {
      return NextResponse.json(
        { error: 'Topic and difficulty are required' },
        { status: 400 }
      );
    }

    const aiClient = getAIClient();
    const systemPrompt = `You are a Korean language conversation tutor. You are having a conversation with a student learning Korean.
    
    Student Level: ${difficulty}
    Topic: ${topic}
    
    Guidelines:
    - Speak naturally in Korean, appropriate for the student's level
    - Use simple vocabulary and grammar for Beginner level
    - Gradually increase complexity for Intermediate and Professional levels
    - Ask questions to encourage the student to practice speaking
    - Provide gentle corrections when needed
    - Keep responses conversational and engaging
    - If the student is silent or doesn't respond, encourage them to speak or repeat your question`;

    const prompt = message || `Let's start a conversation about ${topic}. Please begin the conversation in Korean.`;

    const aiResponse = await aiClient.generateText(prompt, systemPrompt, {
      temperature: 0.8,
      maxTokens: 300,
    });

    // Save or update session
    let session;
    if (sessionId) {
      const existingSession = await prisma.interactiveSession.findUnique({
        where: { id: sessionId },
      });

      if (existingSession) {
        const messages = existingSession.messages as any[];
        messages.push(
          { role: 'user', content: message || 'Start conversation' },
          { role: 'assistant', content: aiResponse.content }
        );

        session = await prisma.interactiveSession.update({
          where: { id: sessionId },
          data: { messages },
        });
      }
    }

    if (!session) {
      session = await prisma.interactiveSession.create({
        data: {
          userId: user.id,
          topic,
          difficulty,
          messages: [
            { role: 'user', content: message || 'Start conversation' },
            { role: 'assistant', content: aiResponse.content },
          ],
        },
      });
    }

    return NextResponse.json({
      message: aiResponse.content,
      sessionId: session.id,
      provider: aiResponse.provider,
    });
  } catch (error) {
    console.error('Interactive chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
