// BelajarYuk - Text Extraction (TXT/MD, PDF via pdf.js, DOCX via Mammoth)

const PDF_JS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDF_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const MAMMOTH_JS_URL = 'https://cdn.jsdelivr.net/npm/mammoth@1.9.0/mammoth.browser.min.js';
export const MAX_UPLOAD_FILES = 5;

export function validateUploadFiles(files) {
  const selectedFiles = Array.from(files || []);
  if (selectedFiles.length > MAX_UPLOAD_FILES) {
    throw new Error(`Maksimal ${MAX_UPLOAD_FILES} berkas dapat diunggah untuk satu paket.`);
  }
  return selectedFiles;
}

let pdfJsPromise = null;
let mammothPromise = null;

/**
 * Lazy load pdf.js from cdnjs only when needed
 */
export function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (pdfJsPromise) return pdfJsPromise;

  pdfJsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = PDF_JS_URL;
    script.async = true;
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
        resolve(window.pdfjsLib);
      } else {
        reject(new Error('pdf.js gagal dimuat dari CDN.'));
      }
    };
    script.onerror = () => reject(new Error('Gagal mengunduh pdf.js dari CDN cdnjs.'));
    document.head.appendChild(script);
  });

  return pdfJsPromise;
}

/**
 * Lazy load Mammoth.js only when a DOCX file is selected.
 */
export function loadMammoth() {
  if (window.mammoth) return Promise.resolve(window.mammoth);
  if (mammothPromise) return mammothPromise;

  mammothPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = MAMMOTH_JS_URL;
    script.async = true;
    script.onload = () => {
      if (window.mammoth) {
        resolve(window.mammoth);
      } else {
        mammothPromise = null;
        reject(new Error('Mammoth.js gagal dimuat dari CDN.'));
      }
    };
    script.onerror = () => {
      mammothPromise = null;
      reject(new Error('Gagal mengunduh Mammoth.js dari CDN jsDelivr.'));
    };
    document.head.appendChild(script);
  });

  return mammothPromise;
}

/**
 * Extract text from a TXT or MD File using standard FileReader
 * @param {File|Blob} file
 * @returns {Promise<string>}
 */
export function extractTextFromTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || '');
    reader.onerror = () => reject(new Error('Gagal membaca berkas teks.'));
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * Extract text from a PDF ArrayBuffer using pdf.js
 * Detects scan/image PDFs with no extractable text layer
 * @param {ArrayBuffer} buffer
 * @returns {Promise<{ text: string, pages: number }>}
 */
export async function extractTextFromPdfBuffer(buffer) {
  const pdfjs = await loadPdfJs();
  const loadingTask = pdfjs.getDocument({ data: buffer });
  const pdfDoc = await loadingTask.promise;

  const pageTexts = [];
  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str || '').filter(Boolean);
    if (strings.length) {
      pageTexts.push(strings.join(' '));
    }
  }

  const fullText = pageTexts.join('\n\n').trim();
  if (!fullText) {
    throw new Error('PDF berupa gambar atau hasil scan tanpa teks terbaca. Tempel transkrip atau ringkasan secara manual.');
  }

  return {
    text: fullText,
    pages: pdfDoc.numPages
  };
}

/**
 * Extract plain text from a DOCX ArrayBuffer using Mammoth.js.
 * @param {ArrayBuffer} buffer
 * @returns {Promise<string>}
 */
export async function extractTextFromDocxBuffer(buffer) {
  const mammoth = await loadMammoth();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  const text = result.value.trim();

  if (!text) {
    throw new Error('Berkas DOCX tidak berisi teks yang bisa dibaca.');
  }

  return text;
}

/**
 * Main extractor: detects file type and extracts readable text
 * @param {File} file
 * @returns {Promise<{ text: string, charCount: number, error?: string }>}
 */
export async function extractFileContent(file) {
  if (!file) {
    throw new Error('Tidak ada berkas yang dipilih.');
  }

  const name = file.name.toLowerCase();

  if (name.endsWith('.txt') || name.endsWith('.md')) {
    const text = await extractTextFromTextFile(file);
    return {
      text: text.trim(),
      charCount: text.length
    };
  }

  if (name.endsWith('.pdf')) {
    const buffer = await file.arrayBuffer();
    const { text } = await extractTextFromPdfBuffer(buffer);
    return {
      text,
      charCount: text.length
    };
  }

  if (name.endsWith('.docx')) {
    const buffer = await file.arrayBuffer();
    const text = await extractTextFromDocxBuffer(buffer);
    return {
      text,
      charCount: text.length
    };
  }

  throw new Error('Format berkas tidak didukung. Harap gunakan berkas .pdf, .txt, .md, atau .docx.');
}
