import { NextRequest, NextResponse } from 'next/server';
import { getTextExtractor } from 'office-text-extractor';
import { Worker } from 'worker_threads';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
  } catch (error: unknown) {
    console.error('Error processing file:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: `Error processing file: ${error.message}`, stack: error.stack }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}

async function processPDF(buffer: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const workerPath = path.resolve(process.cwd(), 'app/api/pdf-worker.js');
    console.log('Worker path:', workerPath);
    
    const worker = new Worker(workerPath);

    worker.on('message', (result) => {
      if (result.error) {
        console.error('PDF processing error:', result.error);
        reject(new Error(result.error));
      } else {
        resolve(result.text);
      }
      worker.terminate();
    });

    worker.on('error', (error: Error) => {
      console.error('Worker error:', error);
      reject(new Error(`PDF processing error: ${error.message}`));
    });

    worker.postMessage({ buffer: Buffer.from(buffer) });
  });
}