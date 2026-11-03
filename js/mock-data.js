// BelajarYuk - Mock Data (Fase 1 & Mode Demo)
export const MOCK_PACKAGES = [
  {
    id: "pkg_20261102_001",
    title: "Farmakologi Dasar: Farmakokinetika",
    createdAt: "2026-11-02T08:30:00Z",
    language: "id",
    sources: {
      text: "Farmakokinetika mempelajari perjalanan obat di dalam tubuh: absorbsi, distribusi, metabolisme, dan ekskresi (ADME). Bioavailabilitas adalah persentase obat yang mencapai sirkulasi sistemik. Organ utama metabolisme adalah hati via enzim sitokrom P450.",
      files: [{ name: "kuliah_farmakokinetika.pdf", chars: 12500 }],
      youtube: [{ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", estMinutes: 25 }]
    },
    summary: {
      title: "Prinsip Utama Farmakokinetika",
      bullets: [
        "ADME adalah 4 tahapan nasib obat: Absorbsi, Distribusi, Metabolisme, dan Ekskresi.",
        "Bioavailabilitas jalur intravena dianggap 100%, sedangkan oral mengalami first-pass effect.",
        "Metabolisme fase I melibatkan oksidasi/reduksi; fase II melibatkan konjugasi agar polar.",
        "Ginjal merupakan organ ekskresi utama lewat filtrasi glomerulus dan sekresi tubulus."
      ],
      keyTerms: [
        { term: "ADME", meaning: "Akronim untuk Absorbsi, Distribusi, Metabolisme, dan Ekskresi." },
        { term: "Bioavailabilitas", meaning: "Fraksi dosis obat aktif yang mencapai sirkulasi sistemik." },
        { term: "First-pass effect", meaning: "Metabolisme awal obat di hati sebelum mencapai sirkulasi umum." },
        { term: "Sitokrom P450", meaning: "Famili enzim hati yang memetabolisme sebagian besar obat." }
      ],
      videoMoments: [
        { approxTime: "04:15", note: "Penjelasan kurva konsentrasi plasma obat vs waktu" },
        { approxTime: "12:30", note: "Mekanisme kerja enzim CYP3A4 di hepatosit" },
        { approxTime: "19:40", note: "Perbedaan klirens ginjal dan waktu paruh eliminasi" }
      ]
    },
    flashcards: [
      { id: "c1", front: "Apa kepanjangan dari ADME?", back: "Absorbsi, Distribusi, Metabolisme, Ekskresi.", tag: "Konsep Dasar", box: 1, dueAt: "2026-11-02" },
      { id: "c2", front: "Rute pemberian obat manakah yang bioavailabilitasnya 100%?", back: "Intravena (IV).", tag: "Rute Obat", box: 1, dueAt: "2026-11-02" },
      { id: "c3", front: "Di organ mana metabolisme lintas pertama (first-pass) terjadi?", back: "Hati (hepar).", tag: "Metabolisme", box: 2, dueAt: "2026-11-03" },
      { id: "c4", front: "Enzim apakah yang paling dominan dalam metabolisme fase I?", back: "Sitokrom P450 (CYP450).", tag: "Enzim", box: 1, dueAt: "2026-11-02" },
      { id: "c5", front: "Apa tujuan utama reaksi konjugasi fase II?", back: "Menjadikan metabolit lebih polar dan larut air untuk ekskresi.", tag: "Metabolisme", box: 3, dueAt: "2026-11-05" },
      { id: "c6", front: "Organ tubuh apa yang menjadi jalur ekskresi obat paling utama?", back: "Ginjal.", tag: "Ekskresi", box: 2, dueAt: "2026-11-03" },
      { id: "c7", front: "Apa definisi waktu paruh (t 1/2) eliminasi?", back: "Waktu yang dibutuhkan kadar obat dalam plasma berkurang 50%.", tag: "Kinetika", box: 1, dueAt: "2026-11-02" },
      { id: "c8", front: "Apa itu volume distribusi (Vd)?", back: "Ukuran teoritis ruang dalam tubuh yang memuat obat pada konsentrasi yang sama.", tag: "Distribusi", box: 1, dueAt: "2026-11-02" }
    ],
    quiz: [
      { id: "q1", question: "Rute pemberian obat yang menghindari first-pass metabolism secara penuh adalah...", options: ["Oral", "Intravena", "Intragastrik", "Enteral"], answerIndex: 1, explanation: "Pemberian intravena langsung masuk ke sirkulasi sistemik tanpa melewati sirkulasi portal hati terlebih dahulu." },
      { id: "q2", question: "Manakah yang merupakan komponen dari ADME?", options: ["Akumulasi", "Distribusi", "Modifikasi", "Evaporasi"], answerIndex: 1, explanation: "D adalah singkatan dari Distribusi (Absorbsi, Distribusi, Metabolisme, Ekskresi)." },
      { id: "q3", question: "Enzim mikrosomal utama di hati untuk metabolisme obat adalah...", options: ["Amilase", "Lipase", "Sitokrom P450", "Pepsin"], answerIndex: 2, explanation: "Enzim sitokrom P450 (CYP) bertanggung jawab atas reaksi oksidasi pada fase I." },
      { id: "q4", question: "Tujuan utama metabolisme obat fase II adalah...", options: ["Meningkatkan kelarutan lipid", "Menjadikan molekul polar agar mudah dibuang", "Memperpanjang waktu paruh", "Memperkuat efek toksik"], answerIndex: 1, explanation: "Fase II menempelkan gugus polar (seperti glukuronid) agar obat larut air dan dibuang via ginjal/empedu." },
      { id: "q5", question: "Jika obat memiliki waktu paruh 4 jam, persentase obat tersisa setelah 8 jam adalah...", options: ["50%", "25%", "12.5%", "0%"], answerIndex: 1, explanation: "Setelah 1 waktu paruh (4 jam) tersisa 50%, setelah 2 waktu paruh (8 jam) tersisa 25%." }
    ],
    quizHistory: [
      { at: "2026-11-02T09:00:00Z", score: 4, total: 5 }
    ]
  },
  {
    id: "pkg_20261102_002",
    title: "Agroekologi: Siklus Hara & Kesuburan Tanah",
    createdAt: "2026-11-02T09:15:00Z",
    language: "id",
    sources: {
      text: "Kesuburan tanah dipengaruhi oleh ketersediaan unsur hara makro (N, P, K, Ca, Mg, S) dan mikro. Bahan organik tanah meningkatkan Kapasitas Tukar Kation (KTK) dan memperbaiki struktur aerasi tanah. Fiksasi nitrogen biologis dibantu oleh bakteri Rhizobium pada bintil akar legum.",
      files: [{ name: "modul_tanah.txt", chars: 8400 }],
      youtube: []
    },
    summary: {
      title: "Ringkasan Siklus Hara Tanah",
      bullets: [
        "Unsur hara makro primer esensial meliputi Nitrogen (N), Fosfor (P), dan Kalium (K).",
        "Bahan organik dan humus berfungsi sebagai penyangga nutrisi dan meningkatkan retensi air.",
        "Kapasitas Tukar Kation (KTK) mengukur kemampuan tanah mengikat kation hara positif.",
        "Simbiosis legum dengan Rhizobium mengubah N2 atmosfer menjadi bentuk amonium yang dapat diserap tanaman."
      ],
      keyTerms: [
        { term: "KTK", meaning: "Kapasitas Tukar Kation: kemampuan koloid tanah menahan dan mempertukarkan kation." },
        { term: "Rhizobium", meaning: "Bakteri penambat nitrogen bebas di udara yang bersimbiosis dengan akar kacang-kacangan." },
        { term: "Humus", meaning: "Materi organik tanah yang telah terdekomposisi sempurna dan stabil." },
        { term: "Defisiensi N", meaning: "Gejala kekurangan nitrogen ditandai daun tua menguning (klorosis)." }
      ],
      videoMoments: []
    },
    flashcards: [
      { id: "c1", front: "Apa tiga unsur hara makro primer bagi tanaman?", back: "Nitrogen (N), Fosfor (P), dan Kalium (K).", tag: "Unsur Hara", box: 1, dueAt: "2026-11-02" },
      { id: "c2", front: "Bakteri apa yang bersimbiosis dengan akar tanaman legum untuk mengikat nitrogen?", back: "Rhizobium.", tag: "Biologi Tanah", box: 2, dueAt: "2026-11-03" },
      { id: "c3", front: "Apa kepanjangan dari KTK dalam analisis tanah?", back: "Kapasitas Tukar Kation.", tag: "Kimia Tanah", box: 1, dueAt: "2026-11-02" },
      { id: "c4", front: "Gejala klorosis daun tua biasanya disebabkan oleh kekurangan unsur apa?", back: "Nitrogen (karena sifatnya yang mobile dalam tanaman).", tag: "Gejala Defisiensi", box: 1, dueAt: "2026-11-02" },
      { id: "c5", front: "Apa peran utama Kalium (K) bagi tanaman?", back: "Mengatur buka-tutup stomata, osmoregulasi, dan ketahanan terhadap stres.", tag: "Fungsi Hara", box: 3, dueAt: "2026-11-06" },
      { id: "c6", front: "Bentuk nitrogen apa yang umumnya diserap oleh akar tanaman?", back: "Nitrat (NO3-) dan Amonium (NH4+).", tag: "Penyerapan", box: 2, dueAt: "2026-11-03" },
      { id: "c7", front: "Mengapa bahan organik meningkatkan daya ikat air pada tanah berpasir?", back: "Karena bahan organik memiliki luas permukaan spesifik dan pori mikro tinggi.", tag: "Fisika Tanah", box: 1, dueAt: "2026-11-02" },
      { id: "c8", front: "Rentang pH tanah yang ideal untuk ketersediaan sebagian besar hara adalah...", back: "Sekitar pH 6.0 sampai 7.0 (netral agak asam).", tag: "pH Tanah", box: 2, dueAt: "2026-11-03" }
    ],
    quiz: [
      { id: "q1", question: "Unsur hara makro primer yang menyusun klorofil dan protein tanaman adalah...", options: ["Kalsium", "Nitrogen", "Besi", "Tembaga"], answerIndex: 1, explanation: "Nitrogen adalah komponen esensial asam amino, protein, dan molekul klorofil." },
      { id: "q2", question: "Kapasitas Tukar Kation (KTK) paling tinggi biasanya ditemukan pada...", options: ["Pasir kuarsa murni", "Bahan organik (humus)", "Debu kasar", "Batu kerikil"], answerIndex: 1, explanation: "Humus memiliki muatan negatif per satuan massa yang sangat tinggi, sehingga KTK-nya melebihi liat." },
      { id: "q3", question: "Simbiosis antara tanaman legum dan Rhizobium menghasilkan pengikatan gas...", options: ["Oksigen (O2)", "Karbon Dioksida (CO2)", "Nitrogen (N2)", "Metana (CH4)"], answerIndex: 2, explanation: "Rhizobium mengikat gas N2 bebas dari udara dan mengubahnya menjadi senyawa nitrogen yang tersedia." },
      { id: "q4", question: "Gejala kekurangan fosfor (P) pada tanaman sering terlihat sebagai...", options: ["Daun berwarna hijau gelap keunguan kerdil", "Tepi daun hangus terbakar", "Daun muda memutih", "Batang layu basah"], answerIndex: 0, explanation: "Kekurangan fosfor menghambat pertumbuhan dan sering memicu akumulasi antosianin (warna keunguan)." },
      { id: "q5", question: "Pemberian kapur pertanian (dolomit/kalsit) bertujuan untuk...", options: ["Menurunkan pH tanah basa", "Menaikkan pH tanah masam", "Membunuh seluruh mikroba tanah", "Menghilangkan bahan organik"], answerIndex: 1, explanation: "Kapur bereaksi menetralkan ion H+ dan Al3+ sehingga menaikkan pH tanah masam ke arah netral." }
    ],
    quizHistory: []
  }
];
