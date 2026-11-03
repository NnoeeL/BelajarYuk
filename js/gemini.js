// BelajarYuk - Gemini and Groq API Clients (Single AI Network Boundary)
import { LEARNING_PACKAGE_SCHEMA, buildGroqResponseSchema, buildSystemInstruction, buildUserPrompt } from './prompts.js';
import { MOCK_PACKAGES } from './mock-data.js';

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 90000;
export const DEFAULT_GEMINI_MODEL = 'gemini-3-flash-preview';
export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b';

export function mapGeminiError(status, message = '') {
  const msgLower = (message || '').toLowerCase();
  if (msgLower.includes('video') && (msgLower.includes('private') || msgLower.includes('unavailable') || msgLower.includes('transcribe'))) {
    return 'Video ini tidak bisa dibaca. Tempel transkripnya secara manual.';
  }
  if (status === 400) {
    return 'Permintaan ditolak. Materi mungkin terlalu panjang atau link tidak valid.';
  }
  if (status === 401 || status === 403) {
    return 'API key tidak valid atau tidak punya akses. Periksa di Pengaturan.';
  }
  if (status === 429) {
    return 'Kuota harian/menit habis. Coba lagi nanti atau kurangi jumlah video.';
  }
  if (status >= 500) {
    return 'Layanan sedang bermasalah. Coba lagi sebentar.';
  }
  if (msgLower.includes('timeout') || msgLower.includes('aborted')) {
    return 'Waktu permintaan habis. Periksa koneksi internet atau kurangi materi.';
  }
  return message || 'Terjadi kesalahan saat memproses materi. Coba lagi.';
}

export function mapGroqError(status, message = '') {
  if (status === 400) return 'Permintaan ditolak oleh Groq. Periksa nama model atau kurangi panjang materi.';
  if (status === 401 || status === 403) return 'API key Groq tidak valid atau tidak punya akses. Periksa di Pengaturan.';
  if (status === 429) return 'Batas penggunaan Groq tercapai. Coba lagi nanti.';
  if (status >= 500) return 'Layanan Groq sedang bermasalah. Coba lagi sebentar.';
  if (message.toLowerCase().includes('timeout') || message.toLowerCase().includes('aborted')) {
    return 'Waktu permintaan habis. Periksa koneksi internet atau kurangi materi.';
  }
  if (status === 0) return 'Tidak dapat terhubung ke Groq. Periksa koneksi internet dan coba lagi.';
  return message || 'Terjadi kesalahan saat menghubungi Groq.';
}

export function sanitizeAiPayload(obj) {
  if (!obj || typeof obj !== 'object') throw new Error('Hasil AI tidak berupa objek.');
  return {
    summary: {
      title: obj.summary?.title || 'Ringkasan Materi',
      bullets: Array.isArray(obj.summary?.bullets) ? obj.summary.bullets : [],
      keyTerms: Array.isArray(obj.summary?.keyTerms) ? obj.summary.keyTerms : [],
      videoMoments: Array.isArray(obj.summary?.videoMoments) ? obj.summary.videoMoments : []
    },
    flashcards: Array.isArray(obj.flashcards) ? obj.flashcards : [],
    quiz: Array.isArray(obj.quiz) ? obj.quiz : []
  };
}

function validateGroqPayload(payload, options) {
  const invalid = (section) => {
    throw new Error(`Hasil Groq untuk ${section} kosong atau tidak lengkap. Coba lagi atau gunakan Gemini.`);
  };
  const hasText = value => typeof value === 'string' && value.trim().length > 0;

  if (options.summary !== false) {
    const summary = payload?.summary;
    if (!hasText(summary?.title) || !Array.isArray(summary.bullets) || summary.bullets.length < 4 ||
        summary.bullets.some(item => !hasText(item)) || !Array.isArray(summary.keyTerms) ||
        summary.keyTerms.length < 1 ||
        summary.keyTerms.some(item => !hasText(item?.term) || !hasText(item?.meaning))) {
      invalid('ringkasan materi');
    }
  }

  if (options.flashcards !== false) {
    const cards = payload?.flashcards;
    const fronts = Array.isArray(cards)
      ? cards.map(card => hasText(card?.front) ? card.front.trim().toLocaleLowerCase() : '')
      : [];
    if (!Array.isArray(cards) || cards.length < 8 ||
        cards.some(card => !hasText(card?.front) || !hasText(card?.back) || !hasText(card?.tag)) ||
        new Set(fronts).size !== fronts.length) {
      invalid('flashcard');
    }
  }

  if (options.quiz !== false) {
    const quiz = payload?.quiz;
    if (!Array.isArray(quiz) || quiz.length < 1 ||
        quiz.some(item => !hasText(item?.question) || !Array.isArray(item?.options) ||
          item.options.length !== 4 || item.options.some(option => !hasText(option)) ||
          !Number.isInteger(item?.answerIndex) || item.answerIndex < 0 || item.answerIndex > 3 ||
          !hasText(item.explanation)) || hasDuplicateQuizQuestions(quiz)) {
      invalid('kuis');
    }
  }
}

function hasDuplicateQuizQuestions(quiz) {
  const questions = quiz.map(item => item.question
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim());
  return new Set(questions).size !== questions.length;
}

function validateQuizPayload(payload, options) {
  if (options.quiz === false) return;

  const quiz = payload?.quiz;
  const hasValidQuestions = Array.isArray(quiz) &&
    quiz.length >= 1 &&
    quiz.every(item => typeof item?.question === 'string' && item.question.trim()) &&
    !hasDuplicateQuizQuestions(quiz);
  if (!hasValidQuestions) {
    throw new Error('Hasil AI untuk kuis kosong atau memiliki soal duplikat. Coba buat ulang.');
  }
}

export function parseAndRepairAiJson(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Hasil AI tidak terbaca. Mencoba memperbaiki…');
  }

  // 1. Bersihkan markdown backticks ```json ... ```
  let cleaned = rawText.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Ekstrak dari kurung kurawal terluar
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }

  // 2. Coba parse langsung
  try {
    return sanitizeAiPayload(JSON.parse(cleaned));
  } catch (e1) {
    // 3. Strategi perbaikan: seimbangkan kutip dan kurung yang belum tertutup
    let repaired = cleaned;
    const quotes = (repaired.match(/(?<!\\)"/g) || []).length;
    if (quotes % 2 !== 0) repaired += '"';
    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}';
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;
    for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']';

    try {
      return sanitizeAiPayload(JSON.parse(repaired));
    } catch (e2) {
      throw new Error('Hasil AI tidak terbaca. Mencoba memperbaiki…');
    }
  }
}

export async function generateLearningPackage({
  title,
  materialText = '',
  youtubeUrls = [],
  options = {},
  settings = {},
  signal = null
}) {
  // Mode Demo (Tanpa API Key)
  if (settings.isDemoMode) {
    await new Promise(r => setTimeout(r, 600));
    const demoPkg = youtubeUrls.length > 0 ? MOCK_PACKAGES[0] : MOCK_PACKAGES[1];
    return {
      summary: demoPkg.summary,
      flashcards: demoPkg.flashcards,
      quiz: demoPkg.quiz
    };
  }

  const provider = settings.provider || 'gemini';
  const apiKey = (provider === 'groq'
    ? settings.groqApiKey || ''
    : settings.geminiApiKey || settings.apiKey || '').trim();
  if (!apiKey) {
    throw new Error(`API key ${provider === 'groq' ? 'Groq' : 'Gemini'} belum diisi. Masukkan API key di Pengaturan atau aktifkan Mode Demo.`);
  }

  if (provider === 'groq') {
    if (youtubeUrls.some(url => url && url.trim())) {
      throw new Error('Groq saat ini memproses teks dan dokumen saja. Hapus link YouTube atau pilih Gemini.');
    }

    return generateWithGroq({
      apiKey,
      model: settings.groqModel || DEFAULT_GROQ_MODEL,
      title,
      materialText,
      options,
      language: settings.language || 'id',
      signal
    });
  }

  const model = settings.geminiModel || settings.model || DEFAULT_GEMINI_MODEL;
  const url = `${API_BASE}/${encodeURIComponent(model)}:generateContent`;

  // Build Parts
  const parts = [];
  for (const yUrl of youtubeUrls) {
    if (yUrl && yUrl.trim()) {
      parts.push({
        fileData: {
          fileUri: yUrl.trim(),
          mimeType: 'video/*'
        }
      });
    }
  }

  async function generateWithGroq({ apiKey, model, title, materialText, options, language, signal }) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const abortFromCaller = () => controller.abort();
    if (signal) {
      if (signal.aborted) controller.abort();
      else signal.addEventListener('abort', abortFromCaller, { once: true });
    }

    const systemInstruction = `${buildSystemInstruction(language)}\n\nBuat setiap ringkasan, kartu, dan soal secara spesifik dari materi. Ringkasan harus memiliki minimal 4 poin dan 1 istilah kunci. Buat minimal 8 flashcard dengan pertanyaan berbeda yang menguji fakta atau konsep tertentu; hindari kartu duplikat dan pertanyaan umum. Jangan pernah mengosongkan nilai field atau memakai teks pengganti umum. Jawab hanya dalam JSON sesuai skema yang diwajibkan.`;
    const userPrompt = buildUserPrompt({ title, materialText, hasVideo: false, options });

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt }
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'learning_package',
              strict: true,
              schema: buildGroqResponseSchema(options)
            }
          }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        let message = '';
        try {
          const errorBody = await response.json();
          message = errorBody?.error?.message || '';
        } catch (error) {
          message = await response.text();
        }
        throw new Error(mapGroqError(response.status, message));
      }

      const data = await response.json();
      const textOut = data.choices?.[0]?.message?.content;
      if (!textOut) throw new Error('Hasil Groq tidak terbaca. Coba model lain di Pengaturan.');
      const parsed = JSON.parse(textOut);
      validateGroqPayload(parsed, options);
      return sanitizeAiPayload(parsed);
    } catch (error) {
      if (error.name === 'AbortError') throw new Error(mapGroqError(0, 'timeout'));
      throw new Error(error.message || 'Terjadi kesalahan saat menghubungi Groq.');
    } finally {
      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', abortFromCaller);
    }
  }

  const userPrompt = buildUserPrompt({
    title,
    materialText,
    hasVideo: youtubeUrls.length > 0,
    options
  });
  parts.push({ text: userPrompt });

  const payload = {
    contents: [{ role: 'user', parts }],
    systemInstruction: {
      parts: [{ text: buildSystemInstruction(settings.language || 'id') }]
    },
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: LEARNING_PACKAGE_SCHEMA
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const effectiveSignal = signal || controller.signal;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload),
      signal: effectiveSignal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errBody = '';
      try {
        const errJson = await response.json();
        errBody = errJson?.error?.message || '';
      } catch (e) {
        errBody = await response.text();
      }
      throw new Error(mapGeminiError(response.status, errBody));
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const textOut = candidate?.content?.parts?.[0]?.text;

    if (!textOut) {
      throw new Error('Hasil AI tidak terbaca. Mencoba memperbaiki…');
    }

    let parsed;
    try {
      parsed = parseAndRepairAiJson(textOut);
    } catch (parseErr) {
      throw new Error('Hasil AI tidak terbaca. Mencoba memperbaiki…');
    }
    validateQuizPayload(parsed, options);
    return parsed;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(mapGeminiError(0, 'timeout'));
    }
    // Re-wrap if not already a mapped error
    throw new Error(err.message || 'Layanan sedang bermasalah. Coba lagi sebentar.');
  }
}
