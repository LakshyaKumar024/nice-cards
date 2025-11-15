// lib/pdf-utils.ts
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker - this is crucial!
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export async function loadPDFFromUrl(url: string): Promise<pdfjsLib.PDFDocumentProxy> {
  try {
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;
    return pdf;
  } catch (error) {
    console.error('Error loading PDF from URL:', error);
    throw new Error('Failed to load PDF from URL');
  }
}

export async function loadPDFDocument(file: File): Promise<pdfjsLib.PDFDocumentProxy> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    const pdf = await loadingTask.promise;
    return pdf;
  } catch (error) {
    console.error('Error loading PDF document:', error);
    throw new Error('Failed to load PDF document');
  }
}