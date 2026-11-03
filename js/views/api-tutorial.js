const GROQ_STEPS = [
  {
    title: 'Masuk atau buat akun Groq',
    description: 'Buka Groq Console, lalu masuk dengan akun yang kamu gunakan atau buat akun baru.',
    image: 'assets/tutorial/groq-01-masuk.png',
    alt: 'Halaman masuk Groq Console dengan pilihan Google, GitHub, SSO, dan email.'
  },
  {
    title: 'Buka dashboard proyek',
    description: 'Setelah masuk, kamu akan berada di dashboard. Pastikan proyek yang dipilih sesuai dengan tempat API key akan dibuat.',
    image: 'assets/tutorial/groq-02-dashboard.png',
    alt: 'Dashboard Groq Console setelah pengguna masuk.'
  },
  {
    title: 'Pilih API Keys',
    description: 'Pilih menu API Keys di bagian atas, lalu tekan Create API Key untuk memulai pembuatan key.',
    image: 'assets/tutorial/groq-03-api-keys.png',
    alt: 'Halaman API Keys Groq dengan tombol Create API Key.'
  },
  {
    title: 'Isi nama dan masa berlaku',
    description: 'Isi nama yang mudah dikenali, misalnya BelajarYuk. Pilih masa berlaku sesuai kebutuhan, lalu tekan Submit.',
    image: 'assets/tutorial/groq-04-buat-api-key.png',
    alt: 'Form pembuatan API key Groq untuk mengisi nama dan masa berlaku.'
  }
];

const GEMINI_STEPS = [
  {
    title: 'Masuk ke Google AI Studio',
    description: 'Buka Google AI Studio dan masuk dengan akun Google. Dari Playground, pilih ikon kunci di kiri bawah untuk membuka API Keys.',
    image: 'assets/tutorial/gemini-01-ai-studio.png',
    alt: 'Google AI Studio Playground dengan ikon API Keys di kiri bawah yang diberi penanda.'
  },
  {
    title: 'Buka menu API Keys',
    description: 'Di dashboard Google AI Studio, pilih API Keys pada menu di sebelah kiri.',
    image: 'assets/tutorial/gemini-02-dashboard.png',
    alt: 'Dashboard Google AI Studio dengan menu API Keys yang diberi penanda; grafik penggunaan disamarkan.'
  },
  {
    title: 'Buat API key',
    description: 'Tekan Create API key di kanan atas. Jika diminta, pilih proyek Google yang sesuai, lalu ikuti konfirmasi untuk membuat key.',
    image: 'assets/tutorial/gemini-03-api-keys.png',
    alt: 'Halaman API Keys Google AI Studio dengan tombol Create API key yang diberi penanda.'
  }
];

const APP_GUIDE_STEPS = [
  {
    title: 'Siapkan koneksi dan API key',
    description: 'Buka BelajarYuk melalui alamat website atau server lokal. Untuk membuat materi dengan AI, pastikan internet aktif, pilih Gemini atau Groq di Pengaturan, masukkan API key penyedia tersebut, lalu tekan Simpan Pengaturan. Mode Demo bisa dicoba tanpa key, tetapi memakai data contoh.',
    image: 'assets/tutorial/app-settings.png',
    alt: 'Halaman Pengaturan BelajarYuk untuk memilih penyedia AI dan memasukkan API key.'
  },
  {
    title: 'Masukkan materi dan pilih hasil',
    description: 'Dari Beranda, pilih Buat Paket. Beri nama paket, tempel teks atau unggah hingga lima berkas PDF, TXT, MD, atau DOCX. Kamu juga bisa menambahkan hingga tiga link YouTube. Pilih ringkasan, flashcard, atau kuis yang ingin dibuat, lalu tekan Buat Paket Belajar. Link YouTube memerlukan Gemini.',
    image: 'assets/tutorial/app-create.png',
    alt: 'Form Buat Paket Belajar untuk mengisi judul, materi, berkas, video, dan pilihan output.'
  },
  {
    title: 'Pelajari ringkasan dan flashcard',
    description: 'Setelah pemrosesan selesai, paket terbuka pada halaman detail. Baca ringkasan atau buka tab Flashcard. Ketuk kartu untuk melihat jawabannya, lalu tandai apakah kamu sudah ingat agar jadwal ulas kartu diperbarui.',
    image: 'assets/tutorial/app-detail.png',
    alt: 'Halaman detail paket BelajarYuk dengan ringkasan materi dan tab belajar.'
  },
  {
    title: 'Atur dan kerjakan kuis',
    description: 'Pilih Mulai Kuis untuk mengatur jumlah soal dan waktu. Kuis bisa tanpa timer, memakai waktu total dalam menit, atau waktu per soal dalam detik. Setelah selesai, hasil dan riwayat kuis ditampilkan.',
    image: 'assets/tutorial/app-quiz-setup.png',
    alt: 'Halaman pengaturan kuis untuk memilih jumlah soal serta jenis timer.'
  },
  {
    title: 'Simpan data dan buat cadangan',
    description: 'Paket belajar tersimpan di browser perangkat ini dan biasanya tetap ada setelah halaman dimuat ulang. Data tidak tersinkron ke perangkat lain dan dapat hilang jika data situs browser dihapus. Buka Pengaturan, pilih bagian Cadangan & Ekspor Data, tekan Unduh Semua Paket (JSON), lalu simpan berkas cadangan di tempat lain.',
    image: 'assets/tutorial/app-backup.png',
    alt: 'Bagian Cadangan dan Ekspor Data di Pengaturan BelajarYuk.'
  }
];

function renderSteps(steps, label, caption = 'Pilih gambar untuk melihat lebih jelas.') {
  return `
    <ol class="api-tutorial-steps" aria-label="${label}">
      ${steps.map((step, index) => `
        <li class="api-tutorial-step">
          <div class="api-tutorial-copy">
            <span class="api-tutorial-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
            <h3>${step.title}</h3>
            <p>${step.description}</p>
          </div>
          <figure class="api-tutorial-figure">
            <button type="button" class="api-tutorial-zoom" data-image="${step.image}" data-alt="${step.alt}" aria-label="Perbesar gambar: ${step.title}">
              <img src="${step.image}" alt="${step.alt}" loading="lazy">
            </button>
            <figcaption>${caption}</figcaption>
          </figure>
        </li>
      `).join('')}
    </ol>
  `;
}

function renderProviderPanel(provider, title, description, url, linkLabel, steps, label) {
  return `
    <section class="api-tutorial-panel" id="tutorial-${provider}" aria-labelledby="tutorial-${provider}-title" hidden>
      <div class="api-tutorial-panel-inner">
        <div class="api-tutorial-provider">
          <div>
            <h2 id="tutorial-${provider}-title">${title}</h2>
            <p>${description}</p>
          </div>
          <a class="btn btn-primary" href="${url}" target="_blank" rel="noopener noreferrer">${linkLabel}</a>
        </div>
        ${renderSteps(steps, label, 'Garis merah menandai bagian yang perlu dipilih. Ketuk gambar untuk memperbesar; tampilan layanan dapat berubah.')}
        <section class="api-tutorial-paste" aria-labelledby="paste-${provider}-title">
          <div>
            <h2 id="paste-${provider}-title">Simpan API key di Pengaturan</h2>
            <p>Salin key yang baru dibuat. Kembali ke BelajarYuk, pilih ${title} sebagai penyedia, tempel key, lalu tekan Simpan Pengaturan.</p>
            <p class="form-hint">Jangan bagikan API key atau tangkapan layar yang menampilkannya.</p>
          </div>
          <a href="#/settings" class="btn btn-secondary">Buka Pengaturan</a>
        </section>
      </div>
    </section>
  `;
}

export function renderApiTutorial(container) {
  container.innerHTML = `
    <div class="view-container api-tutorial">
      <header class="view-header">
        <a href="#/settings" class="btn-back">Kembali ke Pengaturan</a>
        <h1 class="view-title">Panduan BelajarYuk</h1>
        <p class="view-subtitle">Pilih panduan yang kamu perlukan. Konten hanya dibuka setelah kamu memilihnya.</p>
      </header>

      <div class="api-tutorial-choices" role="group" aria-label="Pilih panduan">
        <button type="button" class="api-tutorial-choice" data-tutorial-choice="use" aria-controls="tutorial-use" aria-expanded="false">
          <strong>Cara menggunakan aplikasi</strong>
          <span>Syarat, buat paket, belajar, kuis, dan cadangan.</span>
        </button>
        <button type="button" class="api-tutorial-choice" data-tutorial-choice="gemini" aria-controls="tutorial-gemini" aria-expanded="false">
          <strong>Tutorial API key Gemini</strong>
          <span>Panduan bergambar Google AI Studio.</span>
        </button>
        <button type="button" class="api-tutorial-choice" data-tutorial-choice="groq" aria-controls="tutorial-groq" aria-expanded="false">
          <strong>Tutorial API key Groq</strong>
          <span>Panduan bergambar Groq Console.</span>
        </button>
      </div>

      <section class="api-tutorial-panel" id="tutorial-use" aria-labelledby="tutorial-use-title" hidden>
        <div class="api-tutorial-panel-inner">
          <header class="api-tutorial-guide-intro">
            <h2 id="tutorial-use-title">Cara menggunakan BelajarYuk</h2>
            <p>Untuk membuat bahan belajar dengan AI, siapkan koneksi internet dan API key Gemini atau Groq. Jika belum punya key, pilih salah satu tutorial API key di atas. Mode Demo dapat dicoba tanpa key, tetapi hasilnya berupa data contoh.</p>
            <p>Gunakan browser modern dan buka aplikasi melalui website atau server lokal, bukan dengan membuka berkas HTML langsung. AI memerlukan koneksi internet saat membuat paket.</p>
          </header>
          ${renderSteps(APP_GUIDE_STEPS, 'Langkah menggunakan BelajarYuk', 'Cuplikan layar aplikasi dengan data contoh; kolom API key dikosongkan. Pilih gambar untuk memperbesar.')}
        </div>
      </section>

      ${renderProviderPanel(
        'gemini',
        'Google Gemini',
        'Masuk ke Google AI Studio dan buat API key. Simpan key secara pribadi.',
        'https://aistudio.google.com/apikey',
        'Buka API Keys Google AI Studio',
        GEMINI_STEPS,
        'Langkah membuat API key Gemini'
      )}

      ${renderProviderPanel(
        'groq',
        'Groq',
        'Masuk ke Groq Console dan buat API key. Groq mendukung materi teks dan dokumen; untuk link YouTube gunakan Gemini.',
        'https://console.groq.com/keys',
        'Buka Groq Console',
        GROQ_STEPS,
        'Langkah membuat API key Groq'
      )}

      <dialog class="api-tutorial-dialog" aria-label="Screenshot tutorial API key ukuran penuh">
        <div class="api-tutorial-dialog-content">
          <button type="button" class="btn btn-secondary api-tutorial-close">Tutup gambar</button>
          <img alt="">
        </div>
      </dialog>
    </div>
  `;

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const panels = container.querySelectorAll('.api-tutorial-panel');
  const closeTimers = new WeakMap();

  panels.forEach((panel) => {
    panel.inert = true;
    panel.setAttribute('aria-hidden', 'true');
    panel.addEventListener('transitionend', (event) => {
      if (event.target === panel && event.propertyName === 'grid-template-rows' && !panel.classList.contains('is-open')) {
        clearTimeout(closeTimers.get(panel));
        closeTimers.delete(panel);
        panel.hidden = true;
      }
    });
  });

  container.querySelectorAll('.api-tutorial-choice').forEach((choice) => {
    choice.addEventListener('click', () => {
      const selected = choice.dataset.tutorialChoice;
      const panel = container.querySelector(`#tutorial-${selected}`);
      const shouldOpen = !panel.classList.contains('is-open');
      const reduceMotion = motionPreference.matches;
      panels.forEach((item) => {
        if (item.classList.contains('is-open')) {
          item.classList.remove('is-open');
          item.inert = true;
          item.setAttribute('aria-hidden', 'true');
          if (reduceMotion) {
            item.hidden = true;
          } else {
            closeTimers.set(item, window.setTimeout(() => {
              if (!item.classList.contains('is-open')) item.hidden = true;
            }, 320));
          }
        }
      });
      container.querySelectorAll('.api-tutorial-choice').forEach((item) => {
        item.setAttribute('aria-expanded', 'false');
        item.classList.remove('active');
      });
      if (shouldOpen) {
        clearTimeout(closeTimers.get(panel));
        closeTimers.delete(panel);
        panel.hidden = false;
        panel.inert = false;
        panel.removeAttribute('aria-hidden');
        panel.offsetHeight;
        panel.classList.add('is-open');
        panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        choice.setAttribute('aria-expanded', 'true');
        choice.classList.add('active');
      }
    });
  });

  const dialog = container.querySelector('.api-tutorial-dialog');
  container.querySelectorAll('.api-tutorial-zoom').forEach((button) => {
    button.addEventListener('click', () => {
      const image = dialog.querySelector('img');
      image.src = button.dataset.image;
      image.alt = button.dataset.alt;
      dialog.showModal();
    });
  });
  dialog.querySelector('.api-tutorial-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dialog.close();
    }
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}
