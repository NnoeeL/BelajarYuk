// BelajarYuk - Application Bootstrap & Hash Router
import { renderHome } from './views/home.js';
import { renderCreate } from './views/create.js';
import { renderDetail } from './views/detail.js';
import { renderFlashcards } from './views/flashcards.js';
import { renderQuiz } from './views/quiz.js';
import { renderSettings } from './views/settings.js';
import { renderApiTutorial } from './views/api-tutorial.js';

// SVG Icons (clean, accessible, zero dependency)
const ICONS = {
  home: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  create: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  settings: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
};

function parseHash(hash) {
  const clean = hash.replace(/^#\/?/, '');
  const [pathPart, queryPart] = clean.split('?');
  const path = pathPart ? pathPart.toLowerCase() : 'home';
  const params = {};
  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart);
    for (const [k, v] of searchParams.entries()) {
      params[k] = v;
    }
  }
  return { path, params };
}

function renderShell(appEl) {
  appEl.innerHTML = `
    <div class="app-layout">
      <nav class="app-nav" aria-label="Navigasi Utama">
        <div class="nav-brand">
          <a class="nav-brand-link" href="#/" aria-label="BelajarYuk, kembali ke Beranda">
            <span class="nav-brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5c-2.2-1.6-5.3-1.8-8-1v12c2.7-.8 5.8-.6 8 1 2.2-1.6 5.3-1.8 8-1v-12c-2.7-.8-5.8-.6-8 1Z"/><path d="M12 6.5v12M7 9h2M7 12h2M15 9h2M15 12h2"/></svg>
            </span>
            <span class="nav-brand-copy">
              <strong class="nav-brand-name">BelajarYuk</strong>
              <span class="nav-brand-tagline">Teman belajar mandiri</span>
            </span>
          </a>
        </div>
        <div class="nav-section-label">MENU UTAMA</div>
        <ul class="nav-links">
          <li class="nav-item">
            <a href="#/" class="nav-link" data-route="home">
              ${ICONS.home}
              <span>Beranda</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#/create" class="nav-link" data-route="create">
              ${ICONS.create}
              <span>Buat</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#/settings" class="nav-link" data-route="settings">
              ${ICONS.settings}
              <span>Pengaturan</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#/tutorial" class="nav-link" data-route="tutorial">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5V22M8 7h8M8 11h8"/></svg>
              <span>Tutorial</span>
            </a>
          </li>
        </ul>
        <section class="nav-promo" aria-label="Buat paket belajar">
          <span class="nav-promo-kicker">MULAI BELAJAR</span>
          <h2 class="nav-promo-title">Punya materi baru?</h2>
          <p class="nav-promo-copy">Ubah catatan jadi ringkasan, flashcard, dan kuis.</p>
          <a class="nav-promo-link" href="#/create">
            <span>Buat paket belajar</span>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 10h12M10 4l6 6-6 6"/></svg>
          </a>
        </section>
      </nav>
      <main id="main-content" class="app-main" role="main"></main>
    </div>
  `;
}

function updateActiveNav(currentRoute) {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const route = link.getAttribute('data-route');
    if (route === currentRoute) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

function router() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  const { path, params } = parseHash(window.location.hash);
  updateActiveNav(path);

  switch (path) {
    case '':
    case 'home':
      renderHome(mainContent, params);
      break;
    case 'create':
      renderCreate(mainContent, params);
      break;
    case 'detail':
      renderDetail(mainContent, params);
      break;
    case 'flashcards':
      renderFlashcards(mainContent, params);
      break;
    case 'quiz':
      renderQuiz(mainContent, params);
      break;
    case 'settings':
      renderSettings(mainContent, params);
      break;
    case 'tutorial':
      renderApiTutorial(mainContent);
      break;
    default:
      mainContent.innerHTML = `
        <div class="view-container">
          <h2>Halaman Tidak Ditemukan</h2>
          <p>Rute yang Anda cari tidak tersedia.</p>
          <a href="#/" class="btn-back">&larr; Kembali ke Beranda</a>
        </div>
      `;
  }
}

function init() {
  const theme = localStorage.getItem('belajaryuk_theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  const appEl = document.getElementById('app');
  if (!appEl) return;
  renderShell(appEl);
  window.addEventListener('hashchange', router);
  router();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
