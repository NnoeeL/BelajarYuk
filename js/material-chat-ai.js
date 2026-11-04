const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const REQUEST_TIMEOUT_MS = 30000;
const LONG_MATERIAL_WORDS = 8000;
const CHUNK_WORDS = 400;
const CHUNK_OVERLAP_WORDS = 50;
const MAX_RELEVANT_CHUNKS = 4;
const STOP_WORDS = new Set([
  'apa', 'apakah', 'bagaimana', 'dari', 'dan', 'dengan', 'di', 'ini', 'itu',
  'jelaskan', 'ke', 'mengapa', 'pada', 'yang', 'the', 'what', 'how', 'why',
  'from', 'with', 'this', 'that', 'are', 'was', 'were', 'for'
]);
export const AI_MODEL = 'gemini-3-flash-preview';

export async function callAI(messages, { apiKey, signal } = {}) {
  const key = typeof apiKey === 'string' ? apiKey.trim() : '';
  if (!key) throw new Error('API key Gemini belum diisi. Buka Pengaturan AI untuk menambahkannya.');
  if (!Array.isArray(messages)) throw new Error('Format percakapan tidak valid.');

  const systemInstruction = messages.find(message => message.role === 'system')?.content || '';
  const contents = messages
    .filter(message => message.role === 'user' || message.role === 'assistant')
    .map(message => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(message.content || '') }]
    }));
  if (!contents.length) throw new Error('Pertanyaan tidak boleh kosong.');

  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', abortFromCaller, { once: true });
  }

  try {
    const response = await fetch(
      `${API_BASE}/${encodeURIComponent(AI_MODEL)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': key
        },
        body: JSON.stringify({
          ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
          contents
        }),
        signal: controller.signal
      }
    );

    if (response.status === 401 || response.status === 403) {
      throw new Error('API key tidak valid atau tidak memiliki akses. Periksa Pengaturan AI.');
    }
    if (response.status === 429) {
      throw new Error('Kuota atau batas permintaan Gemini tercapai. Tunggu sebentar, lalu coba lagi.');
    }
    if (!response.ok) {
      let providerMessage = '';
      try {
        const errorBody = await response.json();
        providerMessage = JSON.stringify(errorBody?.error || {}).toUpperCase();
      } catch (error) {
        providerMessage = '';
      }
      if (response.status === 400 &&
          (providerMessage.includes('API_KEY_INVALID') || /API KEY.{0,30}(NOT VALID|INVALID)/.test(providerMessage))) {
        throw new Error('API key tidak valid. Periksa key di Pengaturan AI.');
      }
      throw new Error('Gemini tidak dapat memproses permintaan ini. Coba lagi sebentar.');
    }

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('')
      .trim();
    if (!answer) throw new Error('Gemini mengirim jawaban kosong. Coba lagi.');
    return answer;
  } catch (error) {
    if (error.name === 'AbortError') {
      if (timedOut) throw new Error('Permintaan melewati batas 30 detik. Periksa koneksi, lalu coba lagi.');
      throw error;
    }
    if (error instanceof TypeError) {
      throw new Error('Gagal terhubung ke Gemini. Periksa jaringan atau izin CORS browser, lalu coba lagi.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

export function selectMaterialContext(material, question) {
  const text = typeof material === 'string' ? material.trim() : '';
  const words = text.match(/[\p{L}\p{N}]+/gu) || [];
  if (words.length <= LONG_MATERIAL_WORDS) return text;

  const chunks = [];
  const step = CHUNK_WORDS - CHUNK_OVERLAP_WORDS;
  for (let start = 0; start < words.length; start += step) {
    chunks.push({ index: chunks.length, text: words.slice(start, start + CHUNK_WORDS).join(' ') });
  }
  const queryTerms = (question.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || [])
    .filter(term => term.length > 2 && !STOP_WORDS.has(term));
  const termFrequency = new Map();
  for (const term of queryTerms) termFrequency.set(term, (termFrequency.get(term) || 0) + 1);
  const documentFrequency = new Map();
  for (const term of termFrequency.keys()) {
    documentFrequency.set(term, chunks.reduce((count, chunk) => {
      return count + (chunk.text.toLocaleLowerCase().includes(term) ? 1 : 0);
    }, 0));
  }

  const rankedChunks = chunks.map(chunk => {
    const chunkText = chunk.text.toLocaleLowerCase();
    let score = 0;
    for (const [term, queryCount] of termFrequency) {
      const occurrences = chunkText.match(new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(term)}(?=$|[^\\p{L}\\p{N}])`, 'gu'))?.length || 0;
      if (!occurrences) continue;
      const inverseDocumentFrequency = Math.log((chunks.length + 1) / (documentFrequency.get(term) + 1)) + 1;
      score += queryCount * occurrences * inverseDocumentFrequency;
    }
    return { ...chunk, score };
  });
  const relevant = rankedChunks
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, MAX_RELEVANT_CHUNKS)
    .sort((a, b) => a.index - b.index);
  const selected = relevant.some(chunk => chunk.score > 0) ? relevant : chunks.slice(0, MAX_RELEVANT_CHUNKS);
  return selected.map(chunk => `[Potongan materi ${chunk.index + 1}]\n${chunk.text}`).join('\n\n');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
