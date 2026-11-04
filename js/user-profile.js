const NAME_STORAGE_KEY = 'arsipbelajar_nama';
const SKIPPED_MARKER = 'skipped';
const ALLOWED_NAME_PATTERN = /^[\p{L}\p{N} .'-]+$/u;

let memoryValue = null;
let memoryInitialized = false;

function readStoredValue() {
  try {
    memoryValue = localStorage.getItem(NAME_STORAGE_KEY);
    memoryInitialized = true;
  } catch (error) {
    if (!memoryInitialized) {
      memoryValue = null;
      memoryInitialized = true;
    }
  }
  return memoryValue;
}

function storeValue(value) {
  memoryValue = value;
  memoryInitialized = true;
  try {
    localStorage.setItem(NAME_STORAGE_KEY, value);
  } catch (error) {
    // Keep the value in memory for the current page session.
  }
}

export function sanitizeUserName(value) {
  const name = String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/\p{Cc}/gu, '')
    .trim();

  if (!name) return { valid: false, value: '', message: 'Masukkan nama panggilan terlebih dahulu.' };
  if (name.length > 30) return { valid: false, value: '', message: 'Nama maksimal 30 karakter.' };
  if (!ALLOWED_NAME_PATTERN.test(name)) {
    return { valid: false, value: '', message: 'Gunakan huruf, angka, spasi, titik, tanda hubung, atau apostrof.' };
  }
  return { valid: true, value: name, message: '' };
}

export function getUserName() {
  const value = readStoredValue();
  if (value === SKIPPED_MARKER) return '';
  return sanitizeUserName(value).value;
}

export function getNameOnboardingStatus() {
  const value = readStoredValue();
  const name = value === SKIPPED_MARKER ? '' : sanitizeUserName(value).value;
  return {
    name,
    skipped: value === SKIPPED_MARKER,
    needsOnboarding: !name && value !== SKIPPED_MARKER
  };
}

export function saveUserName(value) {
  const result = sanitizeUserName(value);
  if (result.valid) storeValue(result.value);
  return result;
}

export function skipNameOnboarding() {
  storeValue(SKIPPED_MARKER);
}

export function removeUserName() {
  skipNameOnboarding();
}

export function getUserNameInstruction() {
  const name = getUserName();
  if (!name) return '';
  return `Nama pengguna: "${name}". Sapa dengan namanya sesekali saja secara natural (misalnya di sapaan awal atau saat memberi semangat), jangan di setiap kalimat.`;
}
