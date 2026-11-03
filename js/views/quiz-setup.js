export function renderQuizSetup(container, pkg, onStart) {
  const maxQuestions = pkg.quiz.length;
  const detailUrl = `#/detail?id=${encodeURIComponent(pkg.id)}`;
  container.innerHTML = `
    <div class="view-container">
      <header class="view-header">
        <a href="${detailUrl}" class="btn-back">Kembali ke Detail</a>
        <h1 class="view-title">Atur Kuis</h1>
        <p class="view-subtitle">${escapeHtml(pkg.title)}. Pilih jumlah soal dan batas waktu sebelum mulai.</p>
      </header>

      <form id="quiz-setup-form" class="section-box quiz-setup-form">
        <div class="form-group">
          <label for="quiz-question-count" class="form-label">Jumlah soal</label>
          <input id="quiz-question-count" class="form-input" type="number" min="1" max="${maxQuestions}" step="1" value="${maxQuestions}" required>
          <span class="form-hint">Tersedia ${maxQuestions} soal dalam paket ini.</span>
        </div>

        <div class="form-group">
          <label for="quiz-timer-mode" class="form-label">Batas waktu</label>
          <select id="quiz-timer-mode" class="form-select">
            <option value="none">Tanpa batas waktu</option>
            <option value="total">Waktu total kuis (menit)</option>
            <option value="question">Waktu per soal (detik)</option>
          </select>
          <span class="form-hint">Pilih satu cara menghitung waktu, atau kerjakan tanpa timer.</span>
        </div>

        <div class="form-group quiz-timer-value-group" id="quiz-timer-value-group" hidden>
          <label for="quiz-timer-value" class="form-label" id="quiz-timer-value-label">Durasi kuis</label>
          <div class="quiz-duration-input">
            <input id="quiz-timer-value" class="form-input" type="number" min="1" max="180" step="1" value="10" disabled required>
            <span id="quiz-timer-unit">menit</span>
          </div>
          <span class="form-hint" id="quiz-timer-hint">Timer berjalan terus sampai semua soal selesai.</span>
        </div>

        <div class="quiz-setup-actions">
          <button type="submit" class="btn btn-primary">Mulai Kuis</button>
          <a href="${detailUrl}" class="btn btn-secondary">Batal</a>
        </div>
      </form>
    </div>
  `;

  const form = container.querySelector('#quiz-setup-form');
  const modeSelect = container.querySelector('#quiz-timer-mode');
  const valueInput = container.querySelector('#quiz-timer-value');
  const countInput = container.querySelector('#quiz-question-count');
  const valueGroup = container.querySelector('#quiz-timer-value-group');
  const valueLabel = container.querySelector('#quiz-timer-value-label');
  const valueUnit = container.querySelector('#quiz-timer-unit');
  const valueHint = container.querySelector('#quiz-timer-hint');

  countInput.addEventListener('input', () => countInput.setCustomValidity(''));
  valueInput.addEventListener('input', () => valueInput.setCustomValidity(''));
  modeSelect.addEventListener('change', () => {
    const mode = modeSelect.value;
    valueGroup.hidden = mode === 'none';
    valueInput.disabled = mode === 'none';
    valueInput.max = mode === 'question' ? '600' : '180';
    valueInput.value = mode === 'question' ? '30' : '10';
    valueLabel.textContent = mode === 'question' ? 'Waktu untuk setiap soal' : 'Durasi kuis';
    valueUnit.textContent = mode === 'question' ? 'detik' : 'menit';
    valueHint.textContent = mode === 'question'
      ? 'Setiap soal mendapat hitung mundur sendiri.'
      : 'Timer berjalan terus sampai semua soal selesai.';
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const count = Number(countInput.value);
    const mode = modeSelect.value;
    const value = Number(valueInput.value);
    const maxTimerValue = mode === 'question' ? 600 : 180;
    countInput.setCustomValidity('');
    valueInput.setCustomValidity('');
    if (!Number.isInteger(count) || count < 1 || count > maxQuestions) {
      countInput.setCustomValidity(`Masukkan jumlah soal antara 1 dan ${maxQuestions}.`);
      countInput.reportValidity();
      return;
    }
    if (mode !== 'none' && (!Number.isInteger(value) || value < 1 || value > maxTimerValue)) {
      valueInput.setCustomValidity(`Masukkan waktu antara 1 dan ${maxTimerValue} ${mode === 'question' ? 'detik' : 'menit'}.`);
      valueInput.reportValidity();
      return;
    }
    onStart({
      questionCount: count,
      timerMode: mode,
      timerValue: mode === 'none' ? 0 : value
    });
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
