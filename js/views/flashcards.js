// View: Belajar Flashcard (Mode Balik Kartu dari IndexedDB)
import { getPackageById, getAllPackages, savePackage } from '../storage.js';
import { reviewCard } from '../srs.js';
import { MOCK_PACKAGES } from '../mock-data.js';

export async function renderFlashcards(container, params = {}) {
  let pkg = null;
  if (params.id) {
    pkg = await getPackageById(params.id);
  }
  if (!pkg) {
    const all = await getAllPackages();
    pkg = all[0] || MOCK_PACKAGES[0];
  }

  if (!pkg || !pkg.flashcards?.length) {
    container.innerHTML = `
      <div class="view-container">
        <a href="#/detail?id=${encodeURIComponent(targetId)}" class="btn-back">&larr; Kembali ke Detail</a>
        <h2>Tidak Ada Flashcard</h2>
        <p>Paket ini belum memiliki kartu flashcard untuk dipelajari.</p>
      </div>
    `;
    return;
  }

  const cards = pkg.flashcards;
  let currentIndex = 0;
  let isFlipped = false;
  let rememberedCount = 0;

  function render() {
    if (currentIndex >= cards.length) {
      renderCompleted();
      return;
    }

    const card = cards[currentIndex];
    container.innerHTML = `
      <div class="view-container">
        <header class="view-header">
          <a href="#/detail?id=${encodeURIComponent(pkg.id)}" class="btn-back">&larr; Kembali ke Detail</a>
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <h1 class="view-title" style="font-size:1.25rem;">Belajar Flashcard</h1>
            <span class="badge badge-blue">Kartu ${currentIndex + 1} dari ${cards.length}</span>
          </div>
          <div class="card-meta">
            <span class="badge">${escapeHtml(card.tag || 'Umum')}</span>
            <span class="badge">Kotak ${card.box || 1}</span>
          </div>
        </header>

        <div class="view-body" style="display:flex; flex-direction:column; gap:16px;">
          <!-- Interactive Flashcard Box -->
          <div id="flashcard-card" class="flashcard-box" role="button" tabindex="0" aria-label="Flashcard: ${isFlipped ? 'Jawaban' : 'Pertanyaan'}. Tekan untuk membalik.">
            <span class="badge ${isFlipped ? 'badge-green' : 'badge-blue'}" style="margin-bottom:12px;">
              ${isFlipped ? 'Jawaban (Sisi Belakang)' : 'Pertanyaan (Sisi Depan)'}
            </span>
            <div class="flashcard-text">
              ${escapeHtml(isFlipped ? card.back : card.front)}
            </div>
            <div class="flashcard-hint">
              ${isFlipped ? 'Ketuk kartu untuk melihat pertanyaan' : 'Ketuk kartu untuk melihat jawaban'}
            </div>
          </div>

          <!-- Controls when flipped -->
          ${isFlipped ? `
            <div style="display:flex; gap:12px; justify-content:center;">
              <button id="btn-forgot" class="btn btn-danger" style="flex:1;">Belum Ingat</button>
              <button id="btn-remembered" class="btn btn-primary" style="flex:1;">Sudah Ingat</button>
            </div>
          ` : `
            <button id="btn-flip" class="btn btn-secondary btn-block">Ketuk untuk Membalik Kartu</button>
          `}

          <!-- Quick Navigation -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
            <button id="btn-prev" class="btn btn-secondary btn-sm" ${currentIndex === 0 ? 'disabled' : ''}>&larr; Sebelumnya</button>
            <button id="btn-next" class="btn btn-secondary btn-sm">Lewati &rarr;</button>
          </div>
        </div>
      </div>
    `;

    attachEvents();
  }

  function renderCompleted() {
    container.innerHTML = `
      <div class="view-container">
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <h2 class="empty-title">Sesi Flashcard Selesai!</h2>
          <p class="empty-desc">Kamu telah meninjau seluruh ${cards.length} kartu di paket ini. Terus latih ingatanmu secara berkala.</p>
          <div style="display:flex; gap:10px; margin-top:8px; flex-wrap:wrap; justify-content:center;">
            <button id="btn-restart" class="btn btn-primary">Ulangi Sesi</button>
            <a href="#/detail?id=${encodeURIComponent(pkg.id)}" class="btn btn-secondary">Kembali ke Detail</a>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#btn-restart')?.addEventListener('click', () => {
      currentIndex = 0;
      isFlipped = false;
      rememberedCount = 0;
      render();
    });
  }

  function attachEvents() {
    const cardEl = container.querySelector('#flashcard-card');
    const toggleFlip = () => {
      isFlipped = !isFlipped;
      render();
    };

    cardEl?.addEventListener('click', toggleFlip);
    cardEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFlip();
      }
    });

    container.querySelector('#btn-flip')?.addEventListener('click', toggleFlip);

    container.querySelector('#btn-forgot')?.addEventListener('click', () => {
      cards[currentIndex] = reviewCard(cards[currentIndex], false);
      savePackage(pkg);
      currentIndex++;
      isFlipped = false;
      render();
    });

    container.querySelector('#btn-remembered')?.addEventListener('click', () => {
      cards[currentIndex] = reviewCard(cards[currentIndex], true);
      savePackage(pkg);
      rememberedCount++;
      currentIndex++;
      isFlipped = false;
      render();
    });

    container.querySelector('#btn-prev')?.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        isFlipped = false;
        render();
      }
    });

    container.querySelector('#btn-next')?.addEventListener('click', () => {
      currentIndex++;
      isFlipped = false;
      render();
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
