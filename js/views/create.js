// View: Buat Paket Belajar (Form UI, Ekstraksi Berkas, & Pipeline AI)
import { savePackage, getSettings } from '../storage.js';
import { attachFileUpload, extractSelectedFiles, MAX_UPLOAD_FILES, validateUploadFiles } from './file-upload.js';
import { generateLearningPackage } from '../gemini.js';

export function isValidYouTubeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]{6,}/i.test(url.trim());
}

export function renderCreate(container) {
  let videoRows = [{ url: '', minutes: '' }];
  let isGenerating = false;

  function render() {
    container.innerHTML = `
      <div class="view-container">
        <header class="view-header">
          <a href="#/" class="btn-back">&larr; Kembali</a>
          <h1 class="view-title">Buat Paket Belajar</h1>
          <p class="view-subtitle">Tempel materi teks, unggah berkas, atau sertakan link video YouTube.</p>
        </header>

        <form id="create-form" class="view-body" novalidate style="display:flex; flex-direction:column; gap:12px;">
          <div id="form-error" role="alert" style="display:none;"></div>
          <div id="loading-status" aria-live="polite" class="alert alert-warning" style="display:none;"></div>

          <div class="form-group"><label for="pkg-title" class="form-label">Nama Paket Belajar *</label><input type="text" id="pkg-title" class="form-input" placeholder="Contoh: Farmakologi Bab 3" required ${isGenerating ? 'disabled' : ''}></div>

          <div class="form-group"><label for="pkg-text" class="form-label">Tempel Materi Teks</label><textarea id="pkg-text" class="form-textarea" placeholder="Tempel ringkasan atau catatan kuliah..." ${isGenerating ? 'disabled' : ''}></textarea><div style="display:flex; justify-content:space-between; align-items:center;"><span class="form-hint">Maksimal ±200.000 karakter.</span><span id="char-counter" class="char-count">0 karakter</span></div></div>

          <div class="form-group"><label for="pkg-file" class="form-label">Atau Unggah Berkas (.pdf, .txt, .md, .docx)</label><input type="file" id="pkg-file" class="form-input" accept=".pdf,.txt,.md,.docx" multiple ${isGenerating ? 'disabled' : ''}><span id="file-count" class="form-hint">Pilih hingga ${MAX_UPLOAD_FILES} berkas. Mendukung DOCX, bukan format Word lama (.doc).</span></div>

          <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center;"><label class="form-label">Link Video YouTube (Maks 3)</label><button type="button" id="btn-add-video" class="btn btn-secondary btn-sm" ${videoRows.length >= 3 || isGenerating ? 'disabled' : ''}>+ Tambah Link</button></div>
            <div id="video-list" class="video-list">
              ${videoRows.map((v, idx) => `
                <div class="video-row" data-idx="${idx}">
                  <input type="url" class="form-input video-input" placeholder="https://www.youtube.com/watch?v=..." value="${escapeAttr(v.url)}" ${isGenerating ? 'disabled' : ''}>
                  <input type="number" class="form-input duration-input" min="1" max="300" placeholder="Mnt" value="${escapeAttr(v.minutes)}" ${isGenerating ? 'disabled' : ''}>
                  ${videoRows.length > 1 && !isGenerating ? `<button type="button" class="btn btn-danger btn-sm btn-remove-video" data-idx="${idx}">&times;</button>` : ''}
                </div>
              `).join('')}
            </div>
            <div id="duration-warning" class="alert alert-warning" style="display:none;">Durasi lebih dari 90 menit. Pertimbangkan video yang lebih ringkas.</div>
          </div>

          <div class="form-group">
            <label class="form-label">Pilihan Output Belajar</label>
            <div class="checkbox-group">
              <label class="checkbox-item"><input type="checkbox" id="out-summary" checked ${isGenerating ? 'disabled' : ''}> Ringkasan</label>
              <label class="checkbox-item"><input type="checkbox" id="out-flashcards" checked ${isGenerating ? 'disabled' : ''}> Flashcard</label>
              <label class="checkbox-item"><input type="checkbox" id="out-quiz" checked ${isGenerating ? 'disabled' : ''}> Kuis</label>
            </div>
          </div>

          <div style="margin-top:4px;">
            <button type="submit" id="btn-submit-create" class="btn btn-primary btn-block" ${isGenerating ? 'disabled' : ''}>
              ${isGenerating ? 'Memproses materi dengan AI...' : 'Buat Paket Belajar'}
            </button>
          </div>
        </form>
      </div>
    `;
    attachEvents();
  }

  function updateStatus(msg) {
    const el = container.querySelector('#loading-status');
    if (el) { el.textContent = msg; el.style.display = msg ? 'flex' : 'none'; }
  }
  function showError(msg, isVideoError = false) {
    const el = container.querySelector('#form-error');
    if (!el) return;
    el.className = 'alert alert-danger';
    el.style.display = 'flex';
    el.innerHTML = `<div style="display:flex; flex-direction:column; gap:6px; width:100%;">
      <div>${escapeAttr(msg)}</div>
      ${isVideoError ? `<div id="video-fallback-box" style="margin-top:4px; padding:10px; background:var(--surface); border-radius:var(--radius-sm); border:1px solid var(--border);">
        <div style="font-weight:600; font-size:0.85rem; margin-bottom:4px;">Tempel Transkrip Manual:</div>
        <textarea id="fallback-transcript" class="form-textarea" style="min-height:60px;" placeholder="Salin transkrip dari YouTube ke sini..."></textarea>
        <button type="button" id="btn-apply-transcript" class="btn btn-primary btn-sm" style="margin-top:6px;">Lanjutkan dengan Transkrip</button>
      </div>` : ''}
    </div>`;
    if (isVideoError) {
      container.querySelector('#btn-apply-transcript')?.addEventListener('click', () => {
        const trans = container.querySelector('#fallback-transcript')?.value.trim();
        if (trans) {
          const tEl = container.querySelector('#pkg-text');
          if (tEl) tEl.value = (tEl.value ? tEl.value + '\n\n' : '') + `[Transkrip Video]\n${trans}`;
          videoRows = [{ url: '', minutes: '' }];
          render();
          container.querySelector('#create-form')?.requestSubmit();
        }
      });
    }
  }
  function clearError() {
    const el = container.querySelector('#form-error');
    if (el) el.style.display = 'none';
  }
  function checkTotalDuration() {
    let total = 0;
    container.querySelectorAll('.duration-input').forEach(inp => { const val = parseInt(inp.value, 10); if (!isNaN(val) && val > 0) total += val; });
    const warn = container.querySelector('#duration-warning');
    if (warn) warn.style.display = total > 90 ? 'flex' : 'none';
  }

  function attachEvents() {
    const textInp = container.querySelector('#pkg-text');
    const counterEl = container.querySelector('#char-counter');
    textInp?.addEventListener('input', () => {
      if (counterEl) counterEl.textContent = `${textInp.value.length} karakter`;
    });

    attachFileUpload(container, { clearError, showError });

    container.querySelector('#btn-add-video')?.addEventListener('click', () => {
      if (videoRows.length < 3) { saveCurrentValues(); videoRows.push({ url: '', minutes: '' }); render(); }
    });

    container.querySelectorAll('.btn-remove-video').forEach(btn => {
      btn.addEventListener('click', (e) => {
        saveCurrentValues();
        videoRows.splice(parseInt(e.currentTarget.getAttribute('data-idx'), 10), 1);
        render();
      });
    });

    container.querySelectorAll('.duration-input').forEach(inp => inp.addEventListener('input', checkTotalDuration));

    container.querySelector('#create-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearError();
      const title = container.querySelector('#pkg-title')?.value.trim();
      let text = container.querySelector('#pkg-text')?.value.trim() || '';
      let files;
      try {
        files = validateUploadFiles(container.querySelector('#pkg-file')?.files);
      } catch (error) {
        return showError(error.message);
      }
      const [outS, outF, outQ] = ['#out-summary', '#out-flashcards', '#out-quiz'].map(s => container.querySelector(s)?.checked);

      if (!title) return showError('Isi nama paket belajar terlebih dahulu.');
      saveCurrentValues();
      const validVideos = videoRows.filter(v => v.url.trim());
      for (const v of validVideos) { if (!isValidYouTubeUrl(v.url)) return showError(`Link "${v.url}" bukan URL YouTube yang valid.`); }
      if (!text && files.length === 0 && validVideos.length === 0) return showError('Isi materi teks, berkas, atau link video.');
      if (!outS && !outF && !outQ) return showError('Pilih minimal satu jenis output belajar.');

      isGenerating = true;
      render();

      try {
        const extractedFiles = await extractSelectedFiles(files, updateStatus);
        text = text ? `${text}\n\n${extractedFiles.text}` : extractedFiles.text;
        if (text.length > 200000) {
          updateStatus('Materi lebih dari 200.000 karakter, memotong otomatis...');
          text = text.slice(0, 200000);
        }
        updateStatus('Mengirim ke AI...');
        const settings = getSettings();
        const urls = validVideos.map(v => v.url.trim());
        const ai = await generateLearningPackage({
          title, materialText: text, youtubeUrls: urls,
          options: { summary: outS, flashcards: outF, quiz: outQ }, settings
        });

        updateStatus('Menyimpan paket...');
        const newId = 'pkg_' + Date.now();
        const newPkg = {
          id: newId, title, createdAt: new Date().toISOString(), language: settings.language || 'id',
          sources: { text, files: extractedFiles.sources, youtube: validVideos.map(v => ({ url: v.url.trim(), estMinutes: parseInt(v.minutes, 10) || 0 })) },
          summary: ai.summary || { title, bullets: [], keyTerms: [], videoMoments: [] },
          flashcards: (ai.flashcards || []).map((c, i) => ({ id: `c${i+1}`, front: c.front, back: c.back, tag: c.tag || 'Konsep', box: 1, dueAt: new Date().toISOString().slice(0, 10) })),
          quiz: (ai.quiz || []).map((q, i) => ({ id: `q${i+1}`, question: q.question, options: q.options, answerIndex: q.answerIndex, explanation: q.explanation })),
          quizHistory: []
        };
        const savedPermanently = await savePackage(newPkg);
        const temporaryFlag = savedPermanently ? '' : '&temporary=1';
        window.location.hash = `#/detail?id=${encodeURIComponent(newId)}${temporaryFlag}`;
      } catch (err) {
        isGenerating = false;
        render();
        const isVid = err.message && (err.message.includes('Video ini tidak bisa dibaca') || err.message.toLowerCase().includes('video'));
        showError(err.message || 'Gagal membuat paket belajar.', isVid);
      }
    });
  }

  function saveCurrentValues() {
    container.querySelectorAll('.video-row').forEach((row, i) => {
      if (videoRows[i]) { videoRows[i].url = row.querySelector('.video-input')?.value || ''; videoRows[i].minutes = row.querySelector('.duration-input')?.value || ''; }
    });
  }

  function escapeAttr(str) { return str ? String(str).replace(/"/g, '&quot;') : ''; }

  render();
}
