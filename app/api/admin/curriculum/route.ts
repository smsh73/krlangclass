import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';
import { parseDocument } from '@/lib/document/parser';
import { getAIClient } from '@/lib/ai/client';

// Check if user is admin (simplified - should check admin_users table)
async function isAdmin(userId: string): Promise<boolean> {
  const adminUser = await prisma.adminUser.findFirst({
    where: { id: userId },
  });
  return !!adminUser;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, allow any authenticated user to upload (can be restricted later)
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseDocument(buffer, file.type);

    // Save document
    const document = await prisma.curriculumDocument.create({
      data: {
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        content: buffer,
      },
    });

    // Generate curriculum using AI
    const aiClient = getAIClient();
    const systemPrompt = `You are a Korean language curriculum generator. Analyze the provided document content and create a structured Korean language learning curriculum. 
    The curriculum should include:
    1. Title
    2. Topic/Theme
    3. Difficulty level (Beginner/Intermediate/Professional)
    4. Learning objectives
    5. Detailed content structure
    
    Respond in JSON format with the following structure:
    {
      "title": "Curriculum Title",
      "topic": "Main Topic",
      "difficulty": "Beginner|Intermediate|Professional",
      "description": "Brief description",
      "content": "Detailed curriculum content"
    }`;

    const aiResponse = await aiClient.generateText(
      `Document content:\n\n${parsed.text.substring(0, 4000)}`,
      systemPrompt
    );

    let curriculumData;
    try {
      curriculumData = JSON.parse(aiResponse.content);
    } catch {
      // If JSON parsing fails, create a basic structure
      curriculumData = {
        title: file.name.replace(/\.[^/.]+$/, ''),
        topic: 'General',
        difficulty: 'Beginner',
        description: 'Generated from document',
        content: parsed.text.substring(0, 5000),
      };
    }

    // Create curriculum
    const curriculum = await prisma.curriculum.create({
      data: {
        title: curriculumData.title || file.name,
        topic: curriculumData.topic,
        difficulty: curriculumData.difficulty,
        description: curriculumData.description,
        content: curriculumData.content || parsed.text,
        source: 'document',
        documentId: document.id,
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
    console.error('Curriculum creation error:', error);
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

    const curricula = await prisma.curriculum.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        topic: true,
        difficulty: true,
        description: true,
        source: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ curricula });
  } catch (error) {
    console.error('Get curricula error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
