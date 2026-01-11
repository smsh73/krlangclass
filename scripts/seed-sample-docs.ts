/**
 * Script to seed sample documents into the database
 * Run with: npx tsx scripts/seed-sample-docs.ts
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseDocument } from '../lib/document/parser';
import { getAIClient } from '../lib/ai/client';

const prisma = new PrismaClient();

async function seedSampleDocuments() {
  try {
    console.log('Starting sample document seeding...');

    const documents = [
      {
        filename: '수업일지_2025년10월1일.docx',
        path: join(process.cwd(), '..', '수업일지_2025년10월1일.docx'),
      },
      {
        filename: '한국어교안 week1_전광호.docx',
        path: join(process.cwd(), '..', '한국어교안 week1_전광호.docx'),
      },
    ];

    for (const doc of documents) {
      try {
        console.log(`Processing ${doc.filename}...`);

        // Read file
        const buffer = readFileSync(doc.path);

        // Parse document
        const parsed = await parseDocument(
          buffer,
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );

        // Save document
        const document = await prisma.curriculumDocument.create({
          data: {
            filename: doc.filename,
            originalName: doc.filename,
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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
          curriculumData = {
            title: doc.filename.replace(/\.[^/.]+$/, ''),
            topic: 'General',
            difficulty: 'Beginner',
            description: 'Generated from document',
            content: parsed.text.substring(0, 5000),
          };
        }

        // Create curriculum
        await prisma.curriculum.create({
          data: {
            title: curriculumData.title || doc.filename,
            topic: curriculumData.topic,
            difficulty: curriculumData.difficulty,
            description: curriculumData.description,
            content: curriculumData.content || parsed.text,
            source: 'document',
            documentId: document.id,
          },
        });

        console.log(`✓ Successfully processed ${doc.filename}`);
      } catch (error) {
        console.error(`✗ Error processing ${doc.filename}:`, error);
      }
    }

    console.log('Sample document seeding completed!');
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedSampleDocuments();
