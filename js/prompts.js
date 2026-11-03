// BelajarYuk - Prompts & Gemini JSON Schemas

export const LEARNING_PACKAGE_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING", description: "Judul materi atau ringkasan topik" },
        bullets: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "4-8 poin penting materi pembelajaran"
        },
        keyTerms: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              term: { type: "STRING", description: "Istilah atau konsep kunci" },
              meaning: { type: "STRING", description: "Definisi atau penjelasan istilah" }
            },
            required: ["term", "meaning"]
          },
          description: "Daftar istilah kunci dan artinya"
        },
        videoMoments: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              approxTime: { type: "STRING", description: "Perkiraan waktu menit:detik (misal 14:20)" },
              note: { type: "STRING", description: "Catatan poin penting di menit tersebut" }
            },
            required: ["approxTime", "note"]
          },
          description: "Momen penting video YouTube jika disertakan (kosongkan jika tidak yakin)"
        }
      },
      required: ["title", "bullets", "keyTerms"]
    },
    flashcards: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          front: { type: "STRING", description: "Pertanyaan singkat atau istilah (satu konsep)" },
          back: { type: "STRING", description: "Jawaban langsung dan jelas" },
          tag: { type: "STRING", description: "Topik atau bab kartu" }
        },
        required: ["front", "back", "tag"]
      },
      description: "Daftar kartu flashcard untuk hafalan berulang"
    },
    quiz: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING", description: "Pertanyaan latihan" },
          options: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "Tepat 4 opsi pilihan jawaban"
          },
          answerIndex: { type: "INTEGER", description: "Indeks jawaban benar (0, 1, 2, atau 3)" },
          explanation: { type: "STRING", description: "Pembahasan ringkas 1-2 kalimat" }
        },
        required: ["question", "options", "answerIndex", "explanation"]
      },
      description: "Daftar butir soal kuis pilihan ganda"
    }
  },
  required: ["summary", "flashcards", "quiz"]
};

function toJsonSchema(schema) {
  const result = {};
  if (schema.type) result.type = schema.type.toLowerCase();
  if (schema.description) result.description = schema.description;
  if (schema.enum) result.enum = schema.enum;

  if (schema.properties) {
    result.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => [key, toJsonSchema(value)])
    );
    result.required = Object.keys(result.properties);
    result.additionalProperties = false;
  }

  if (schema.items) result.items = toJsonSchema(schema.items);
  return result;
}

export function buildGroqResponseSchema(options = {}) {
  const selected = {
    summary: options.summary !== false,
    flashcards: options.flashcards !== false,
    quiz: options.quiz !== false
  };
  const properties = Object.fromEntries(
    Object.entries(LEARNING_PACKAGE_SCHEMA.properties)
      .filter(([key]) => selected[key])
      .map(([key, value]) => [key, toJsonSchema(value)])
  );

  return {
    type: 'object',
    properties,
    required: Object.keys(properties),
    additionalProperties: false
  };
}

/**
 * Build the system instruction for Gemini
 * @param {string} language ('id' | 'en')
 */
export function buildSystemInstruction(language = 'id') {
  const langName = language === 'en' ? 'Bahasa Inggris (English)' : 'Bahasa Indonesia';
  return [
    'Kamu adalah asisten belajar mahasiswa yang bertugas mengubah materi kuliah menjadi ringkasan, flashcard, dan kuis latihan bermutu tinggi.',
    'ATURAN KETAT:',
    '1. Gunakan HANYA fakta dan informasi dari materi yang diberikan (teks, modul, dan video). JANGAN PERNAH mengarang, menambah spekulasi, atau berasumsi di luar materi.',
    `2. Seluruh hasil keluaran harus ditulis dalam ${langName}. Gunakan bahasa yang mudah dipahami, ramah, dan tidak berbelit-belit.`,
    '3. Flashcard: buat pertanyaan singkat yang berfokus hanya pada satu konsep per kartu.',
    '4. Kuis: buat pertanyaan pilihan ganda dengan tepat 4 opsi jawaban, 1 indeks jawaban benar (0-3), dan pembahasan ringkas 1-2 kalimat berdasarkan materi.',
    '5. Video YouTube: jika materi memiliki video, cantumkan videoMoments HANYA jika yakin. Tulis approxTime dalam format menit:detik.',
    '6. Keluaran HARUS berupa objek JSON valid sesuai skema yang telah ditentukan.'
  ].join('\n');
}

/**
 * Build user prompt text for Gemini
 * @param {object} params
 */
export function buildUserPrompt({ title, materialText, hasVideo, options = {} }) {
  const parts = [];

  parts.push(`Judul Paket: ${title || 'Materi Belajar'}`);

  if (materialText) {
    parts.push('\n--- MATERI TEKS / DOKUMEN ---');
    parts.push(materialText);
    parts.push('--- AKHIR MATERI TEKS ---');
  }

  if (hasVideo) {
    parts.push('\nCatatan: Video YouTube disertakan dalam permintaan ini. Analisis audio/visual video tersebut bersama materi teks di atas.');
  }

  parts.push('\nInstruksi Tugas:');
  if (options.summary !== false) {
    parts.push('- Susun ringkasan materi, poin-poin penting, dan istilah kunci.');
  }
  if (options.flashcards !== false) {
    parts.push('- Buat minimal 8 butir flashcard (satu konsep per kartu).');
  }
  if (options.quiz !== false) {
    parts.push('- Buat minimal 5 butir soal kuis pilihan ganda dengan 4 opsi dan pembahasan.');
  }

  return parts.join('\n');
}
