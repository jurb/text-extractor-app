const { parentPort } = require('worker_threads');

if (parentPort) {
  parentPort.on('message', async (data) => {
    try {
      const pdfParse = await import('pdf-parse');
      const pdfBuffer = Buffer.from(data.buffer);
      const pdfData = await pdfParse.default(pdfBuffer);
      parentPort.postMessage({ text: pdfData.text });
    } catch (error) {
      parentPort.postMessage({ error: error.message });
    }
  });
}