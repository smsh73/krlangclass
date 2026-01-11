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

    const { questions, answers } = await request.json();

    if (!questions || !answers) {
      return NextResponse.json(
        { error: 'Questions and answers are required' },
        { status: 400 }
      );
    }

    // Evaluate using AI
    const aiClient = getAIClient();
    const systemPrompt = `You are a Korean language proficiency evaluator. Evaluate the student's answers and determine their level.

    Levels:
    - Beginner: Basic vocabulary, simple sentences, limited grammar
    - Intermediate: Good vocabulary, complex sentences, understanding of grammar rules
    - Professional: Advanced vocabulary, nuanced expressions, native-like proficiency

    Respond in JSON format:
    {
      "result": "Beginner|Intermediate|Professional",
      "score": 0.0-1.0,
      "feedback": "Detailed feedback on performance"
    }`;

    const prompt = `Questions: ${JSON.stringify(questions)}\n\nAnswers: ${JSON.stringify(answers)}\n\nEvaluate the student's Korean language proficiency level.`;

    const aiResponse = await aiClient.generateText(prompt, systemPrompt);

    let evaluation;
    try {
      evaluation = JSON.parse(aiResponse.content);
    } catch {
      evaluation = {
        result: 'Beginner',
        score: 0.5,
        feedback: 'Evaluation completed',
      };
    }

    // Save test result
    const testResult = await prisma.levelTest.create({
      data: {
        userId: user.id,
        questions,
        answers,
        result: evaluation.result,
        score: evaluation.score,
      },
    });

    // Update user level
    await prisma.user.update({
      where: { id: user.id },
      data: { level: evaluation.result },
    });

    return NextResponse.json({
      success: true,
      result: evaluation.result,
      score: evaluation.score,
      feedback: evaluation.feedback,
      testId: testResult.id,
    });
  } catch (error) {
    console.error('Level test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate test questions using AI
    const aiClient = getAIClient();
    const systemPrompt = `You are a Korean language test creator. Create a comprehensive level test with 5 questions.

    Include:
    - Speaking questions (pronunciation, fluency)
    - Grammar questions
    - Vocabulary questions
    - Comprehension questions

    Respond in JSON format:
    {
      "questions": [
        {
          "type": "speaking|grammar|vocabulary|comprehension",
          "question": "Question text",
          "hint": "Optional hint"
        }
      ]
    }`;

    const aiResponse = await aiClient.generateText(
      'Create a Korean language proficiency test with 5 diverse questions.',
      systemPrompt
    );

    let questions;
    try {
      questions = JSON.parse(aiResponse.content);
    } catch {
      questions = {
        questions: [
          { type: 'speaking', question: 'Please introduce yourself in Korean.' },
          { type: 'grammar', question: 'Complete: 저는 한국어를 ___ 좋아합니다.' },
          { type: 'vocabulary', question: 'What does "안녕하세요" mean?' },
          { type: 'comprehension', question: 'Read this: "오늘 날씨가 좋습니다." What does it mean?' },
          { type: 'speaking', question: 'Describe your favorite food in Korean.' },
        ],
      };
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Generate test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
