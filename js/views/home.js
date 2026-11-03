// View: Beranda (Daftar Paket & Empty State dari IndexedDB)
import { getAllPackages, savePackage, deletePackage } from '../storage.js';
import { MOCK_PACKAGES } from '../mock-data.js';

export async function renderHome(container) {
  let packages = await getAllPackages();

  // If first time launch and DB is empty, auto-populate with demo packages
  if (packages.length === 0 && !localStorage.getItem('belajaryuk_initial_seeded')) {
    for (const p of MOCK_PACKAGES) {
      await savePackage(p);
    }
    localStorage.setItem('belajaryuk_initial_seeded', '1');
    packages = await getAllPackages();
  }

  function render() {
    container.innerHTML = `
      <div class="view-container">
        <header class="view-header">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
            <div>
              <div class="badge" style="margin-bottom:8px;">✨ Belajar Mandiri Berbasis AI</div>
              <h1 class="view-title">Halo, Mahasiswa! 👋</h1>
              <p class="view-subtitle">Kelola dan pelajari materi kuliahmu dalam ringkasan, flashcard, dan kuis.</p>
            </div>
            ${packages.length > 0 ? `
              <a href="#/create" class="btn btn-primary btn-sm">+ Buat Paket</a>
            ` : ''}
          </div>
        </header>

        <div id="home-content" class="view-body">
          ${packages.length === 0 ? renderEmptyState() : renderPackageList()}
        </div>
      </div>
    `;

    attachEvents();
  }

  function renderEmptyState() {
    return `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          <line x1="9" y1="7" x2="15" y2="7"/>
          <line x1="9" y1="11" x2="13" y2="11"/>
        </svg>
        <h2 class="empty-title">Belum ada paket belajar</h2>
        <p class="empty-desc">Ubah materi kuliah yang kamu miliki menjadi ringkasan, flashcard, dan kuis otomatis.</p>
        <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center;">
          <a href="#/create" class="btn btn-primary">Buat Paket Pertama</a>
          <button id="btn-reset-mock" class="btn btn-secondary btn-sm" type="button">Muat Paket Contoh</button>
        </div>
      </div>
    `;
  }

  function renderPackageList() {
    return `
      <div class="package-list">
        ${packages.map(pkg => `
          <article class="card" data-id="${pkg.id}">
            <div class="card-header">
              <h2 class="card-title">${escapeHtml(pkg.title)}</h2>
            </div>
            <div class="card-meta">
              <span class="badge badge-blue">🗂️ ${pkg.flashcards?.length || 0} Flashcard</span>
              <span class="badge badge-green">🎯 ${pkg.quiz?.length || 0} Soal Kuis</span>
              ${pkg.summary?.bullets?.length ? `<span class="badge" style="background:var(--pastel-sky); color:var(--pastel-sky-text); border:1px solid var(--pastel-sky-border);">📑 Ringkasan</span>` : ''}
              ${pkg.sources?.youtube?.length ? `<span class="badge" style="background:var(--pastel-coral); color:var(--pastel-coral-text); border:1px solid var(--pastel-coral-border);">📹 ${pkg.sources.youtube.length} Video</span>` : ''}
            </div>
            <div class="card-actions">
              <button class="btn btn-danger btn-sm btn-delete-pkg" data-id="${pkg.id}" aria-label="Hapus paket ${escapeHtml(pkg.title)}">Hapus</button>
              <a href="#/detail?id=${encodeURIComponent(pkg.id)}" class="btn btn-primary btn-sm">Buka Paket</a>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  function attachEvents() {
    container.querySelectorAll('.btn-delete-pkg').forEach(btn => {
      btn.onclick = async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        await deletePackage(id);
        packages = await getAllPackages();
        render();
      };
    });

    const resetBtn = container.querySelector('#btn-reset-mock');
    if (resetBtn) {
      resetBtn.onclick = async () => {
        for (const p of MOCK_PACKAGES) {
          await savePackage(p);
        }
        packages = await getAllPackages();
        render();
      };
    }
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

