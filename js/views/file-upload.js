import { extractFileContent, MAX_UPLOAD_FILES, validateUploadFiles } from '../extract.js';

export { MAX_UPLOAD_FILES, validateUploadFiles };

export function attachFileUpload(container, { clearError, showError }) {
  container.querySelector('#pkg-file')?.addEventListener('change', event => {
    const fileInput = event.currentTarget;
    const countLabel = container.querySelector('#file-count');
    try {
      const selectedFiles = validateUploadFiles(fileInput.files);
      clearError();
      if (countLabel) {
        countLabel.textContent = selectedFiles.length
          ? `${selectedFiles.length} dari ${MAX_UPLOAD_FILES} berkas dipilih.`
          : `Pilih hingga ${MAX_UPLOAD_FILES} berkas. Mendukung DOCX, bukan format Word lama (.doc).`;
      }
    } catch (error) {
      fileInput.value = '';
      if (countLabel) countLabel.textContent = `Pilih hingga ${MAX_UPLOAD_FILES} berkas. Mendukung DOCX, bukan format Word lama (.doc).`;
      showError(error.message);
    }
  });
}

export async function extractSelectedFiles(files, onProgress) {
  const selectedFiles = validateUploadFiles(files);
  const sources = [];
  let text = '';
  for (const [index, file] of selectedFiles.entries()) {
    onProgress(`Membaca berkas ${index + 1} dari ${selectedFiles.length}: ${file.name}...`);
    const extracted = await extractFileContent(file);
    sources.push({ name: file.name, chars: extracted.charCount });
    text = text ? `${text}\n\n${extracted.text}` : extracted.text;
  }
  return { text, sources };
}
