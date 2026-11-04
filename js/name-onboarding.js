import {
  getNameOnboardingStatus,
  removeUserName,
  saveUserName,
  skipNameOnboarding
} from './user-profile.js';

export function mountNameOnboarding(container) {
  const greeting = document.createElement('header');
  greeting.className = 'user-greeting';
  greeting.setAttribute('aria-label', 'Sapaan pengguna');
  const greetingText = document.createElement('h1');
  greetingText.className = 'user-greeting-title';
  const actions = document.createElement('div');
  actions.className = 'user-greeting-actions';
  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'btn btn-secondary btn-sm';
  editButton.textContent = 'Ubah nama';
  editButton.setAttribute('aria-label', 'Ubah nama panggilan');
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'btn btn-secondary btn-sm';
  removeButton.textContent = 'Hapus namaku';
  actions.append(editButton, removeButton);
  greeting.append(greetingText, actions);

  const dialog = document.createElement('dialog');
  dialog.className = 'name-onboarding-dialog';
  dialog.setAttribute('aria-labelledby', 'name-onboarding-title');
  const heading = document.createElement('h2');
  heading.id = 'name-onboarding-title';
  heading.className = 'section-title';
  const form = document.createElement('form');
  form.className = 'name-onboarding-form';
  const label = document.createElement('label');
  label.htmlFor = 'name-onboarding-input';
  label.className = 'form-label';
  label.textContent = 'Nama panggilan';
  const input = document.createElement('input');
  input.id = 'name-onboarding-input';
  input.type = 'text';
  input.className = 'form-input';
  input.maxLength = 30;
  input.autocomplete = 'nickname';
  input.autofocus = true;
  input.placeholder = 'Contoh: Budi';
  const error = document.createElement('p');
  error.className = 'name-onboarding-error';
  error.setAttribute('role', 'alert');
  const privacyNote = document.createElement('p');
  privacyNote.className = 'form-hint';
  privacyNote.textContent = 'Namamu hanya disimpan di browser ini.';
  const formActions = document.createElement('div');
  formActions.className = 'name-onboarding-actions';
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'btn btn-primary';
  const skipButton = document.createElement('button');
  skipButton.type = 'button';
  skipButton.className = 'btn btn-secondary btn-sm';
  formActions.append(submitButton, skipButton);
  form.append(label, input, error, privacyNote, formActions);
  dialog.append(heading, form);
  container.append(greeting, dialog);

  let editingExistingName = false;

  function renderGreeting() {
    const { name } = getNameOnboardingStatus();
    greetingText.textContent = name ? `Halo, ${name}!` : 'Halo, Mahasiswa!';
    removeButton.hidden = !name;
  }

  function open(edit = false) {
    const { name } = getNameOnboardingStatus();
    editingExistingName = edit && Boolean(name);
    heading.textContent = editingExistingName ? 'Ganti nama panggilanmu' : 'Hai! Siapa nama panggilanmu?';
    submitButton.textContent = editingExistingName ? 'Simpan nama' : 'Mulai';
    skipButton.textContent = editingExistingName ? 'Batal' : 'Lewati';
    input.value = editingExistingName ? name : '';
    error.textContent = '';
    if (!dialog.open) dialog.showModal();
    input.focus();
  }

  function skip() {
    if (!editingExistingName) skipNameOnboarding();
    dialog.close();
    renderGreeting();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const result = saveUserName(input.value);
    if (!result.valid) {
      error.textContent = result.message;
      input.focus();
      return;
    }
    dialog.close();
    renderGreeting();
  });
  skipButton.addEventListener('click', skip);
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    skip();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      skip();
    }
  });
  editButton.addEventListener('click', () => open(true));
  removeButton.addEventListener('click', () => {
    removeUserName();
    renderGreeting();
  });

  renderGreeting();
  if (getNameOnboardingStatus().needsOnboarding) open();

  return {
    destroy() {
      if (dialog.open) dialog.close();
      greeting.remove();
      dialog.remove();
    }
  };
}
