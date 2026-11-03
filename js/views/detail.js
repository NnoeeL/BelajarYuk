// View: Detail Paket Belajar (Tab Ringkasan, Flashcard, Kuis dari IndexedDB)
import { getPackageById, getAllPackages, exportFlashcardsCsv, downloadBlob } from '../storage.js';
import { MOCK_PACKAGES } from '../mock-data.js';

export async function renderDetail(container, params = {}) {
  let pkg = params.id ? await getPackageById(params.id) : null;
  if (!pkg) pkg = (await getAllPackages())[0] || MOCK_PACKAGES[0];

  if (!pkg) {
    container.innerHTML = `<div class="view-container"><a href="#/" class="btn-back">&larr; Kembali</a><h2>Paket Tidak Ditemukan</h2></div>`;
    return;
  }

  let activeTab = 'summary';

  function render() {
    container.innerHTML = `
      <div class="view-container">
        <header class="view-header">
          <a href="#/" class="btn-back">&larr; Kembali ke Beranda</a>
          <h1 class="view-title">${escapeHtml(pkg.title)}</h1>
          ${params.temporary === '1' ? `<div class="alert alert-warning" role="status">Browser tidak dapat menyimpan paket ini secara permanen. Paket hanya tersedia selama sesi ini. Segera buka Pengaturan dan unduh cadangan JSON, lalu gunakan browser dengan penyimpanan situs aktif.</div>` : ''}
          <div class="card-meta">
            <span>Dibuat: ${new Date(pkg.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
            <span>Bahasa: ${pkg.language.toUpperCase()}</span>
            ${pkg.sources?.youtube?.length ? `<span class="badge">📹 ${pkg.sources.youtube.length} Video</span>` : ''}
          </div>
          <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
            <a href="#/flashcards?id=${encodeURIComponent(pkg.id)}" class="btn btn-primary btn-sm">Mulai Flashcard</a>
            <a href="#/quiz?id=${encodeURIComponent(pkg.id)}" class="btn btn-secondary btn-sm">Mulai Kuis</a>
          </div>
        </header>

        <nav class="tabs-header" aria-label="Tab Detail Paket">
          <button class="tab-btn ${activeTab === 'summary' ? 'active' : ''}" data-tab="summary">Ringkasan</button>
          <button class="tab-btn ${activeTab === 'flashcards' ? 'active' : ''}" data-tab="flashcards">Flashcard (${pkg.flashcards?.length || 0})</button>
          <button class="tab-btn ${activeTab === 'quiz' ? 'active' : ''}" data-tab="quiz">Kuis (${pkg.quiz?.length || 0})</button>
        </nav>

        <div class="tab-content">
          ${activeTab === 'summary' ? renderSummaryTab() : ''}
          ${activeTab === 'flashcards' ? renderFlashcardsTab() : ''}
          ${activeTab === 'quiz' ? renderQuizTab() : ''}
        </div>
      </div>
    `;

    attachEvents();
  }

  function renderSummaryTab() {
    const s = pkg.summary || {};
    return `
      <div class="section-box">
        <h2 class="section-title">${escapeHtml(s.title || 'Ringkasan Materi')}</h2>
        <ul class="bullet-list">
          ${(s.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}
        </ul>
      </div>

      ${s.keyTerms?.length ? `
        <div class="section-box">
          <h2 class="section-title">Istilah Kunci</h2>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:10px;">
            ${s.keyTerms.map(t => `
              <div class="term-card">
                <span class="term-name">${escapeHtml(t.term)}</span>
                <span class="term-desc">${escapeHtml(t.meaning)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${s.videoMoments?.length ? `
        <div class="section-box">
          <h2 class="section-title">Momen Penting Video</h2>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${s.videoMoments.map(m => `
              <div class="term-card">
                <div style="display:flex; align-items:center; gap:6px;">
                  <span class="badge" style="background:var(--pastel-sky); color:var(--pastel-sky-text); border:1px solid var(--pastel-sky-border);">⏱️ Menit ${escapeHtml(m.approxTime)}</span>
                  <span class="badge" style="background:var(--pastel-honey); color:var(--pastel-honey-text); border:1px solid var(--pastel-honey-border);">(perkiraan)</span>
                </div>
                <p class="term-desc" style="margin-top:4px;">${escapeHtml(m.note)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  function renderFlashcardsTab() {
    const cards = pkg.flashcards || [];
    return `
      <div class="section-box">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <h2 class="section-title">Daftar Flashcard</h2>
            <p class="form-hint">Total ${cards.length} kartu hafalan.</p>
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" id="btn-export-csv" class="btn btn-secondary btn-sm">📄 Ekspor CSV (Anki)</button>
            <a href="#/flashcards?id=${encodeURIComponent(pkg.id)}" class="btn btn-primary btn-sm">Mulai Sesi Belajar &rarr;</a>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
          ${cards.map((c, idx) => `
            <div class="term-card">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="badge badge-blue">Kartu #${idx + 1} &bull; ${escapeHtml(c.tag || 'Umum')}</span>
                <span class="badge">Kotak ${c.box || 1}</span>
              </div>
              <p style="font-weight:600; margin-top:4px;">${escapeHtml(c.front)}</p>
              <p style="color:var(--text-muted); font-size:0.875rem;">${escapeHtml(c.back)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderQuizTab() {
    const questions = pkg.quiz || [];
    const history = pkg.quizHistory || [];
    return `
      <div class="section-box">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <h2 class="section-title">Latihan Soal Kuis</h2>
            <p class="form-hint">Total ${questions.length} butir pertanyaan pilihan ganda.</p>
          </div>
          <a href="#/quiz?id=${encodeURIComponent(pkg.id)}" class="btn btn-primary btn-sm">Mulai Kerjakan Kuis &rarr;</a>
        </div>

        ${history.length ? `
          <div style="margin-top:12px; padding:10px 12px; background:var(--surface-hover); border-radius:var(--radius-sm);">
            <div style="font-weight:600; font-size:0.875rem; margin-bottom:4px;">Riwayat Nilai Terakhir:</div>
            ${history.map(h => `
              <div style="font-size:0.85rem; color:var(--text-muted); display:flex; justify-content:space-between;">
                <span>${new Date(h.at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                <strong style="color:var(--primary);">Skor: ${h.score} / ${h.total}</strong>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">
          ${questions.map((q, idx) => `
            <div class="term-card">
              <div style="font-weight:600;">${idx + 1}. ${escapeHtml(q.question)}</div>
              <ol type="A" style="padding-left:20px; font-size:0.85rem; margin-top:6px; display:flex; flex-direction:column; gap:2px;">
                ${q.options.map((opt, oIdx) => `
                  <li style="${oIdx === q.answerIndex ? 'font-weight:700; color:var(--success);' : ''}">${escapeHtml(opt)}</li>
                `).join('')}
              </ol>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function attachEvents() {
    container.querySelectorAll('.tab-btn').forEach(btn => {
      const tabName = btn.getAttribute('data-tab');
      btn.onclick = () => { activeTab = tabName; render(); };
    });

    container.querySelector('#btn-export-csv')?.addEventListener('click', () => {
      const csv = exportFlashcardsCsv(pkg.flashcards);
      downloadBlob(csv, `${pkg.title || 'flashcards'}.csv`, 'text/csv');
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  render();
}
