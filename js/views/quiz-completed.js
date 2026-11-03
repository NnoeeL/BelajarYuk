import { savePackage } from '../storage.js';

export function renderQuizCompleted(container, pkg, questions, score, onRetry) {
  if (!pkg.quizHistory) pkg.quizHistory = [];
  pkg.quizHistory.unshift({
    at: new Date().toISOString(),
    score,
    total: questions.length
  });
  savePackage(pkg);

  const percent = Math.round((score / questions.length) * 100);
  container.innerHTML = `
    <div class="view-container">
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="8" r="7"/>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
        </svg>
        <h2 class="empty-title">Kuis Selesai!</h2>
        <div style="font-size:2rem; font-weight:800; color:var(--primary); margin:8px 0;" id="final-score-text">
          ${score} / ${questions.length}
        </div>
        <p class="empty-desc">
          Kamu menjawab benar <strong>${percent}%</strong> dari seluruh pertanyaan.
          ${percent >= 80 ? 'Pemahamanmu terhadap materi ini luar biasa!' : 'Bagus! Ulangi kuis untuk memperkuat ingatanmu.'}
        </p>
        <div class="quiz-setup-actions">
          <button id="btn-retry-quiz" class="btn btn-primary">Ulangi Kuis</button>
          <a href="#/detail?id=${encodeURIComponent(pkg.id)}" class="btn btn-secondary">Kembali ke Detail</a>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#btn-retry-quiz')?.addEventListener('click', onRetry);
}
