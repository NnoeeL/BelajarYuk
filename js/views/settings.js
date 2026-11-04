// View: Pengaturan & Onboarding
import { getSettings, saveSettings, exportAllPackagesJson, importPackagesJson, downloadBlob } from '../storage.js';
import { DEFAULT_GEMINI_MODEL, DEFAULT_GROQ_MODEL } from '../gemini.js';

export const DEFAULT_MODEL = DEFAULT_GEMINI_MODEL;

export function renderSettings(container) {
  let settings = getSettings();
  let showKey = false;
  const draftKeys = {
    gemini: settings.geminiApiKey || settings.apiKey || '',
    groq: settings.groqApiKey || ''
  };
  const draftModels = {
    gemini: settings.geminiModel || settings.model || DEFAULT_GEMINI_MODEL,
    groq: settings.groqModel || DEFAULT_GROQ_MODEL
  };

  function getProviderDetails(provider) {
    return     provider === 'groq'
    ? {
        keyLabel: 'Groq API Key',
          keyPlaceholder: 'Tempel API key Groq',
          keyUrl: 'https://console.groq.com/keys',
          keyLink: 'Groq Console',
          model: DEFAULT_GROQ_MODEL,
          modelHint: `Bawaan: ${DEFAULT_GROQ_MODEL}. Model tersedia dapat berubah.`,
          capability: 'Groq memproses teks dan dokumen. Untuk analisis link YouTube, pilih Gemini.'
        }
      : {
          keyLabel: 'Google Gemini API Key',
          keyPlaceholder: 'Tempel API key Gemini (contoh: AIzaSy...)',
          keyUrl: 'https://aistudio.google.com/apikey',
          keyLink: 'Google AI Studio',
          model: DEFAULT_GEMINI_MODEL,
          modelHint: `Bawaan: ${DEFAULT_GEMINI_MODEL}. Model dapat diubah sewaktu-waktu.`,
          capability: 'Tanya Materi memakai API key Gemini ini. Gemini juga dapat memproses teks, dokumen, dan link video YouTube.'
        };
  }

  function render() {
    const provider = settings.provider === 'groq' ? 'groq' : 'gemini';
    const providerDetails = getProviderDetails(provider);
    container.innerHTML = `
      <div class="view-container">
        <header class="view-header">
          <h1 class="view-title">Pengaturan</h1>
          <p class="view-subtitle">Pilih penyedia AI dan atur preferensi aplikasi.</p>
        </header>

        <div id="settings-status" role="alert" style="display:none;"></div>

        <section class="section-box settings-storage-note" aria-labelledby="settings-storage-title">
          <h2 id="settings-storage-title" class="section-title">Penyimpanan di perangkat</h2>
          <p>Materi dan API key dikirim langsung ke penyedia AI yang kamu pilih. Paket belajar disimpan di browser perangkat ini, bukan di cloud ArsipBelajar, dan tidak otomatis tersinkron ke perangkat lain.</p>
          <p>Data browser bisa hilang jika data situs dihapus, kamu memakai mode privat, atau penyimpanan browser bermasalah. Unduh cadangan JSON secara berkala di bagian Cadangan & Ekspor Data.</p>
        </section>

        <section class="section-box settings-gemini-recommendation" aria-labelledby="settings-gemini-title">
          <div>
            <h2 id="settings-gemini-title" class="section-title">Rekomendasi untuk mulai: Gemini</h2>
            <p>Gemini mendukung teks, dokumen, dan link video YouTube. Tutorial bergambarnya juga tersedia di ArsipBelajar. Groq tetap bisa dipilih untuk materi teks dan dokumen.</p>
          </div>
          <div class="settings-gemini-actions">
            <a class="btn btn-primary btn-sm" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">Buat Gemini API key</a>
            <a class="btn btn-secondary btn-sm" href="#/tutorial">Lihat tutorial API key</a>
          </div>
        </section>

        <form id="settings-form" class="view-body" style="display:flex; flex-direction:column; gap:16px;">
          <div class="form-group">
            <label for="setting-provider" class="form-label">Penyedia AI</label>
            <select id="setting-provider" class="form-select">
              <option value="gemini" ${provider === 'gemini' ? 'selected' : ''}>Google Gemini</option>
              <option value="groq" ${provider === 'groq' ? 'selected' : ''}>Groq</option>
            </select>
            <span class="form-hint">${providerDetails.capability}</span>
          </div>

          <div class="form-group">
            <label for="setting-api-key" class="form-label">${providerDetails.keyLabel}</label>
            <div style="display:flex; gap:8px;">
              <input type="${showKey ? 'text' : 'password'}" id="setting-api-key" class="form-input"
                placeholder="${providerDetails.keyPlaceholder}" value="${escapeAttr(draftKeys[provider])}">
              <button type="button" id="btn-toggle-key" class="btn btn-secondary btn-sm" style="white-space:nowrap;">
                ${showKey ? 'Sembunyikan' : 'Lihat'}
              </button>
            </div>
            <span class="form-hint">
              Dapatkan key melalui <a href="${providerDetails.keyUrl}" target="_blank" rel="noopener">${providerDetails.keyLink}</a>. Key disimpan di browser perangkat Anda.
            </span>
            <a href="#/tutorial" class="btn btn-secondary btn-sm settings-tutorial-link">Lihat tutorial cara mendapatkan API key</a>
          </div>

          <!-- Mode Demo Toggle -->
          <div class="section-box" style="border:1px dashed var(--border);">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <div>
                <strong style="font-size:0.95rem;">Mode Demo (Tanpa Key)</strong>
                <p class="form-hint">Gunakan data contoh otomatis tanpa API key.</p>
              </div>
              <button type="button" id="btn-toggle-demo" class="btn ${settings.isDemoMode ? 'btn-danger' : 'btn-secondary'} btn-sm">
                ${settings.isDemoMode ? 'Matikan Mode Demo' : 'Aktifkan Mode Demo'}
              </button>
            </div>
            ${settings.isDemoMode ? `
              <div class="badge badge-green" style="margin-top:8px; width:fit-content;">✓ Mode Demo Aktif</div>
            ` : ''}
          </div>

          <!-- Model Name -->
          <div class="form-group">
            <label for="setting-model" class="form-label">Nama Model AI</label>
            <input type="text" id="setting-model" class="form-input"
              value="${escapeAttr(draftModels[provider])}" placeholder="${providerDetails.model}">
            <span class="form-hint">${providerDetails.modelHint}</span>
          </div>

          <!-- Output Language -->
          <div class="form-group">
            <label for="setting-lang" class="form-label">Bahasa Hasil Belajar</label>
            <select id="setting-lang" class="form-select">
              <option value="id" ${settings.language === 'id' ? 'selected' : ''}>Bahasa Indonesia</option>
              <option value="en" ${settings.language === 'en' ? 'selected' : ''}>Bahasa Inggris (English)</option>
            </select>
            <span class="form-hint">Bahasa yang digunakan AI saat menyusun ringkasan, flashcard, dan kuis.</span>
          </div>

          <!-- Theme -->
          <div class="form-group">
            <label for="setting-theme" class="form-label">Tema Tampilan</label>
            <select id="setting-theme" class="form-select">
              <option value="system" ${localStorage.getItem('arsipbelajar_theme') === 'system' ? 'selected' : ''}>Ikuti Sistem</option>
              <option value="light" ${localStorage.getItem('arsipbelajar_theme') === 'light' ? 'selected' : ''}>Terang (Light)</option>
              <option value="dark" ${localStorage.getItem('arsipbelajar_theme') === 'dark' ? 'selected' : ''}>Gelap (Dark)</option>
            </select>
          </div>

          <div style="margin-top:8px;">
            <button type="submit" id="btn-save-settings" class="btn btn-primary btn-block">Simpan Pengaturan</button>
          </div>
        </form>

        <!-- Backup & Restore -->
        <div class="section-box" style="margin-top:8px;">
          <h2 class="section-title">Cadangan & Ekspor Data</h2>
          <p class="form-hint">Unduh seluruh paket belajarmu dalam format JSON atau pulihkan cadangan sebelumnya. Simpan cadangan di luar browser agar dapat dipulihkan jika data situs terhapus.</p>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
            <button type="button" id="btn-export-json" class="btn btn-secondary btn-sm">Unduh Semua Paket (JSON)</button>
            <label class="btn btn-secondary btn-sm" style="cursor:pointer; margin:0;">
              Impor Berkas JSON
              <input type="file" id="file-import-json" accept=".json" style="display:none;">
            </label>
          </div>
        </div>

        <section class="section-box settings-about" aria-labelledby="settings-about-title">
          <div>
            <h2 id="settings-about-title" class="section-title">Tentang ArsipBelajar</h2>
            <p>ArsipBelajar membantu menyusun materi kuliah menjadi ringkasan, flashcard, dan kuis latihan.</p>
          </div>
          <div class="settings-about-developer">
            <span class="form-hint">Dikembangkan oleh</span>
            <strong>Muhammad Farrel</strong>
          </div>
          <div class="settings-about-links" aria-label="Media sosial pengembang">
            <a class="settings-social-icon" href="https://github.com/NnoeeL" target="_blank" rel="noopener noreferrer" aria-label="GitHub NnoeeL" title="GitHub NnoeeL">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 .1.76 2.26 3.32 1.7.1-.73.39-1.23.7-1.51-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.16-3-.12-.28-.5-1.42.11-2.96 0 0 .95-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.16 1.78 1.16 3 0 4.29-2.61 5.23-5.1 5.51.4.35.75 1.03.75 2.08v3.32c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/></svg>
            </a>
            <a class="settings-social-icon" href="https://www.instagram.com/nnoelfr/" target="_blank" rel="noopener noreferrer" aria-label="Instagram @nnoelfr" title="Instagram @nnoelfr">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><circle cx="17.6" cy="6.7" r="1.1" fill="currentColor"/></svg>
            </a>
            <a class="settings-social-icon" href="https://www.tiktok.com/@nno3el" target="_blank" rel="noopener noreferrer" aria-label="TikTok @nno3el" title="TikTok @nno3el">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 3c.4 2.4 1.8 3.9 4.4 4.1v3.4a9.3 9.3 0 0 1-4.4-1.3v6.2a6.7 6.7 0 1 1-6.7-6.7c.5 0 1 .1 1.5.2v3.6a3.3 3.3 0 1 0 1.8 3V3h3.4Z"/></svg>
            </a>
          </div>
          <a class="btn btn-primary btn-sm settings-portfolio-link" href="https://nnoeel.github.io/" target="_blank" rel="noopener noreferrer">Portofolio</a>
          <p class="settings-about-copyright">© 2026 Muhammad Farrel. ArsipBelajar dilisensikan di bawah MIT.</p>
        </section>
      </div>
    `;

    attachEvents();
  }

  function attachEvents() {
    container.querySelector('#setting-provider')?.addEventListener('change', (event) => {
      const currentProvider = settings.provider === 'groq' ? 'groq' : 'gemini';
      draftKeys[currentProvider] = container.querySelector('#setting-api-key')?.value.trim() || '';
      draftModels[currentProvider] = container.querySelector('#setting-model')?.value.trim() || getProviderDetails(currentProvider).model;
      settings.provider = event.currentTarget.value;
      render();
    });

    container.querySelector('#btn-toggle-key')?.addEventListener('click', () => {
      const provider = settings.provider === 'groq' ? 'groq' : 'gemini';
      draftKeys[provider] = container.querySelector('#setting-api-key')?.value || '';
      showKey = !showKey;
      render();
    });

    container.querySelector('#btn-toggle-demo')?.addEventListener('click', () => {
      settings.isDemoMode = !settings.isDemoMode;
      saveSettings({ isDemoMode: settings.isDemoMode });
      showNotice(settings.isDemoMode ? 'Mode Demo diaktifkan.' : 'Mode Demo dinonaktifkan.');
      render();
    });

    container.querySelector('#settings-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const provider = settings.provider === 'groq' ? 'groq' : 'gemini';
      draftKeys[provider] = container.querySelector('#setting-api-key')?.value.trim() || '';
      draftModels[provider] = container.querySelector('#setting-model')?.value.trim() || getProviderDetails(provider).model;
      const language = container.querySelector('#setting-lang')?.value || 'id';
      const theme = container.querySelector('#setting-theme')?.value || 'system';

      const saved = saveSettings({
        provider,
        apiKey: draftKeys.gemini,
        model: draftModels.gemini,
        geminiApiKey: draftKeys.gemini,
        geminiModel: draftModels.gemini,
        groqApiKey: draftKeys.groq,
        groqModel: draftModels.groq,
        language
      });
      if (!saved) {
        const el = container.querySelector('#settings-status');
        if (el) { el.className = 'alert alert-danger'; el.textContent = 'Pengaturan gagal disimpan. Periksa penyimpanan browser Anda.'; el.style.display = 'flex'; }
        return;
      }
      localStorage.setItem('arsipbelajar_theme', theme);

      // Apply theme
      if (theme === 'system') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }

      settings = getSettings();
      showNotice('Pengaturan berhasil disimpan ke perangkat.');
    });

    // Export JSON
    container.querySelector('#btn-export-json')?.addEventListener('click', async () => {
      const json = await exportAllPackagesJson();
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadBlob(json, `arsipbelajar-backup-${dateStr}.json`);
      showNotice('Semua paket berhasil diunduh sebagai JSON.');
    });

    // Import JSON
    container.querySelector('#file-import-json')?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const count = await importPackagesJson(text);
        showNotice(`Berhasil memulihkan ${count} paket belajar dari berkas JSON.`);
      } catch (err) {
        const el = container.querySelector('#settings-status');
        if (el) { el.className = 'alert alert-danger'; el.textContent = err.message || 'Gagal mengimpor berkas JSON.'; el.style.display = 'flex'; }
      }
    });
  }

  function showNotice(msg) {
    const el = container.querySelector('#settings-status');
    if (!el) return;
    el.className = 'alert alert-success';
    el.textContent = msg;
    el.style.display = 'flex';
  }

  function escapeAttr(str) {
    if (!str) return '';
    return String(str).replace(/"/g, '&quot;');
  }

  render();
}
