import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/db/client';
import { getAIClient } from '@/lib/ai/client';

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, difficulty, learningObjectives, description } = await request.json();

    if (!topic || !difficulty) {
      return NextResponse.json(
        { error: 'Topic and difficulty are required' },
        { status: 400 }
      );
    }

    // Generate curriculum using AI
    const aiClient = getAIClient();
    const systemPrompt = `You are a Korean language curriculum generator. Create a comprehensive Korean language learning curriculum based on the provided information.
    
    The curriculum should be structured, educational, and appropriate for the specified difficulty level.
    Include:
    1. Detailed learning content
    2. Vocabulary lists
    3. Grammar points
    4. Practice exercises
    5. Cultural context (if relevant)
    
    Respond in JSON format:
    {
      "title": "Curriculum Title",
      "content": "Detailed curriculum content with sections, vocabulary, grammar, exercises",
      "description": "Brief description of the curriculum"
    }`;

    const prompt = `Create a Korean language learning curriculum with the following specifications:
- Topic: ${topic}
- Difficulty Level: ${difficulty}
${learningObjectives ? `- Learning Objectives: ${learningObjectives}` : ''}
${description ? `- Additional Context: ${description}` : ''}

Generate a comprehensive curriculum that includes vocabulary, grammar, examples, and practice materials.`;

    const aiResponse = await aiClient.generateText(prompt, systemPrompt);

    let curriculumData;
    try {
      curriculumData = JSON.parse(aiResponse.content);
    } catch {
      curriculumData = {
        title: `${topic} - ${difficulty} Level`,
        content: aiResponse.content,
        description: description || `Korean language curriculum for ${topic} at ${difficulty} level`,
      };
    }

    // Create curriculum
    const curriculum = await prisma.curriculum.create({
      data: {
        title: curriculumData.title || `${topic} - ${difficulty}`,
        topic: topic,
        difficulty: difficulty,
        description: curriculumData.description || description,
        content: curriculumData.content || aiResponse.content,
        source: 'ai_generated',
      },
    });

    return NextResponse.json({
      success: true,
      curriculum: {
        id: curriculum.id,
        title: curriculum.title,
        topic: curriculum.topic,
        difficulty: curriculum.difficulty,
      },
    });
  } catch (error) {
    console.error('Curriculum generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
