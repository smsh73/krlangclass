import mammoth from 'mammoth';

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
    // Use dynamic import for pdf-parse to avoid ESM/CommonJS issues
    const pdfParseModule = await import('pdf-parse');
    // pdf-parse exports PDFParse class, use it to parse the buffer
    const PDFParse = pdfParseModule.PDFParse || (pdfParseModule as any).default?.PDFParse || pdfParseModule;
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const infoResult = await parser.getInfo();
    await parser.destroy();
    return {
      text: textResult.text,
      metadata: {
        title: infoResult.info?.Title,
        author: infoResult.info?.Author,
        pages: infoResult.total || 0,
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
