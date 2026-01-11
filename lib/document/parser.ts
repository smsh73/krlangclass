import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

export interface ParsedDocument {
  text: string;
  metadata?: {
    title?: string;
    author?: string;
    pages?: number;
  };
}

export async function parseDocx(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value,
      metadata: result.messages.length > 0 ? { title: 'Document' } : undefined,
    };
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error}`);
  }
}

export async function parsePdf(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const data = await pdfParse(buffer);
    return {
      text: data.text,
      metadata: {
        title: data.info?.Title,
        author: data.info?.Author,
        pages: data.numpages,
      },
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error}`);
  }
}

export async function parseDocument(
  buffer: Buffer,
  mimeType: string
): Promise<ParsedDocument> {
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword') {
    return parseDocx(buffer);
  } else if (mimeType === 'application/pdf') {
    return parsePdf(buffer);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
