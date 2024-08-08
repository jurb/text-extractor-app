import { NextRequest, NextResponse } from 'next/server';
import { getTextExtractor } from 'office-text-extractor';
import { Worker } from 'worker_threads';
import path from 'path';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  try {
    const buffer = await file.arrayBuffer();
    const mimeType = file.type;

    let text: string;

    if (mimeType === 'application/pdf') {
      text = await processPDF(buffer);
    } else {
      const extractor = getTextExtractor();
      text = await extractor.extractText({ input: Buffer.from(buffer), type: 'buffer' });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ error: 'Error processing file' }, { status: 500 });
  }
}

async function processPDF(buffer: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(process.cwd(), 'app/api/pdf-worker.js'));

    worker.on('message', (result) => {
      if (result.error) {
        reject(new Error(result.error));
      } else {
        resolve(result.text);
      }
      worker.terminate();
    });

    worker.on('error', reject);
    worker.postMessage({ buffer: Buffer.from(buffer) });
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};