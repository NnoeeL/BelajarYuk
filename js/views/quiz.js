// View: Kerjakan Kuis (Pilihan Jawaban, Pembahasan, Skor Akhir dari IndexedDB)
import { getPackageById, getAllPackages } from '../storage.js';
import { MOCK_PACKAGES } from '../mock-data.js';
import { renderQuizSetup } from './quiz-setup.js';
import { renderQuizCompleted } from './quiz-completed.js';

export function formatQuizTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export async function renderQuiz(container, params = {}) {
  let pkg = params.id ? await getPackageById(params.id) : null;
  if (!pkg) {
    const all = await getAllPackages();
    pkg = all[0] || MOCK_PACKAGES[0];
  }

  if (!pkg || !pkg.quiz?.length) {
    container.innerHTML = `
      <div class="view-container">
        <a href="${pkg?.id ? `#/detail?id=${encodeURIComponent(pkg.id)}` : '#/'}" class="btn-back">Kembali</a>
        <h2>Tidak Ada Soal Kuis</h2>
        <p>Paket ini belum memiliki butir soal kuis untuk dikerjakan.</p>
      </div>
    `;
    return;
  }

  const availableQuestions = pkg.quiz;
  const LETTERS = ['A', 'B', 'C', 'D', 'E'];
  let questions = [];
  let quizSettings = { timerMode: 'none', timerValue: 10 };
  let currentIndex = 0;
  let selectedOption = null;
  let isAnswered = false;
  let timedOut = false;
  let score = 0;
  let remainingSeconds = 0;
  let timerInterval = null;
  let completed = false;

  function clearTimer() {
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  const stopQuizOnNavigation = () => {
    clearTimer();
    window.removeEventListener('hashchange', stopQuizOnNavigation);
  };
  window.addEventListener('hashchange', stopQuizOnNavigation);

  function startQuiz(config) {
    quizSettings = config;
    questions = availableQuestions.slice(0, config.questionCount);
    currentIndex = 0;
    selectedOption = null;
    isAnswered = false;
    timedOut = false;
    score = 0;
    completed = false;
    remainingSeconds = config.timerMode === 'total' ? config.timerValue * 60 : config.timerValue;
    render();
  }

  function render() {
    clearTimer();
    if (currentIndex >= questions.length) {
      renderCompleted();
      return;
    }

    const q = questions[currentIndex];
    const isTimed = quizSettings.timerMode !== 'none';
    const timerName = quizSettings.timerMode === 'question' ? 'Sisa waktu soal' : 'Sisa waktu kuis';
    container.innerHTML = `
      <div class="view-container">
        <header class="view-header">
          <a href="#/detail?id=${encodeURIComponent(pkg.id)}" class="btn-back">Kembali ke Detail</a>
          <div class="quiz-progress-header">
            <h1 class="view-title">Kuis Latihan</h1>
            <span class="badge badge-blue">Soal ${currentIndex + 1} dari ${questions.length}</span>
          </div>
          ${isTimed ? `<div class="quiz-timer${remainingSeconds <= 10 ? ' quiz-timer-urgent' : ''}" role="timer" aria-label="${timerName}"><span>${timerName}</span><strong id="quiz-timer-value">${formatQuizTime(remainingSeconds)}</strong></div>` : ''}
        </header>

        <div class="view-body" style="display:flex; flex-direction:column; gap:16px;">
          <div class="section-box">
            <h2 style="font-size:1.05rem; font-weight:600; line-height:1.4;">${currentIndex + 1}. ${escapeHtml(q.question)}</h2>

            <div class="quiz-options">
              ${q.options.map((opt, idx) => {
                let optClass = 'quiz-opt';
                if (isAnswered) {
                  if (idx === q.answerIndex) optClass += ' selected-correct';
                  else if (idx === selectedOption) optClass += ' selected-wrong';
                }
                return `
                  <button type="button" class="${optClass}" data-idx="${idx}" ${isAnswered ? 'disabled' : ''}>
                    <span class="quiz-opt-letter">${LETTERS[idx] || idx + 1}</span>
                    <span>${escapeHtml(opt)}</span>
                  </button>
                `;
              }).join('')}
            </div>

            ${isAnswered ? `
              <div class="quiz-explanation" style="margin-top:16px;">
                <div style="font-weight:700; margin-bottom:4px; color:${timedOut ? 'var(--warning)' : selectedOption === q.answerIndex ? 'var(--success)' : 'var(--danger)'};">
                  ${timedOut ? 'Waktu untuk soal ini habis.' : selectedOption === q.answerIndex ? 'Jawabanmu benar!' : 'Jawabanmu kurang tepat'}
                </div>
                <div><strong>Pembahasan:</strong> ${escapeHtml(q.explanation)}</div>
              </div>

              <div class="quiz-next-action">
                <button id="btn-next-question" class="btn btn-primary">
                  ${currentIndex + 1 === questions.length ? 'Lihat Skor Akhir' : 'Soal Berikutnya'}
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    attachEvents();
    if (isTimed && (!isAnswered || quizSettings.timerMode === 'total')) startTimer();
  }

  function startTimer() {
    clearTimer();
    timerInterval = setInterval(() => {
      remainingSeconds = Math.max(remainingSeconds - 1, 0);
      const timerText = container.querySelector('#quiz-timer-value');
      if (timerText) timerText.textContent = formatQuizTime(remainingSeconds);
      const timer = container.querySelector('.quiz-timer');
      if (timer) timer.classList.toggle('quiz-timer-urgent', remainingSeconds <= 10);
      if (remainingSeconds === 0) {
        clearTimer();
        if (quizSettings.timerMode === 'total') {
          currentIndex = questions.length;
          render();
        } else {
          timedOut = true;
          isAnswered = true;
          selectedOption = null;
          render();
        }
      }
    }, 1000);
  }

  function renderCompleted() {
    clearTimer();
    if (completed) return;
    completed = true;
    renderQuizCompleted(container, pkg, questions, score, () => startQuiz(quizSettings));
  }

  function attachEvents() {
    container.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', event => {
        if (isAnswered) return;
        const idx = Number(event.currentTarget.getAttribute('data-idx'));
        selectedOption = idx;
        isAnswered = true;
        if (idx === questions[currentIndex].answerIndex) score++;
        if (quizSettings.timerMode === 'question') clearTimer();
        render();
      });
    });

    container.querySelector('#btn-next-question')?.addEventListener('click', () => {
      currentIndex++;
      selectedOption = null;
      isAnswered = false;
      timedOut = false;
      if (quizSettings.timerMode === 'question') remainingSeconds = quizSettings.timerValue;
      render();
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  renderQuizSetup(container, pkg, startQuiz);
}
