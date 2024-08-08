'use client';

import React, { useState, useCallback } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setText(data.text);
    } catch (error) {
      console.error('Fout:', error);
      setText('Fout bij het extraheren van tekst');
    } finally {
      setIsLoading(false);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length) {
      handleFile(files[0]);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Tekst Extractor</h1>
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div 
            className={`mb-6 border-2 border-dashed rounded-md p-6 ${
              isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {/* <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Upload een bestand of sleep het hierheen
            </label> */}
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload een bestand</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                      accept=".docx,.pptx,.xlsx,.pdf"
                    />
                  </label>
                  <p className="pl-1">of sleep het hierheen</p>
                </div>
                <p className="text-xs text-gray-500">DOCX, PPTX, XLSX, PDF tot 10MB</p>
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : text ? (
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Tekst in bestand:</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{text}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}