import { parentPort } from 'worker_threads';
import pdfParse from 'pdf-parse';

if (parentPort) {
  parentPort.on('message', async (data) => {
    try {
      const pdfBuffer = Buffer.from(data.buffer);
      const pdfData = await pdfParse(pdfBuffer);
      parentPort.postMessage({ text: pdfData.text });
    } catch (error) {
      parentPort.postMessage({ error: error.message });
    }
  });
}