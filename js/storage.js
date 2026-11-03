// BelajarYuk - Storage (IndexedDB for Packages, localStorage for Settings)

const DB_NAME = 'belajaryuk_db';
const DB_VERSION = 1;
const STORE_PACKAGES = 'packages';

let memPackages = []; // Fallback for private mode / blocked storage

function openDB() {
  return new Promise((resolve, reject) => {
    try {
      if (!window.indexedDB) {
        return reject(new Error('IndexedDB not supported'));
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_PACKAGES)) {
          db.createObjectStore(STORE_PACKAGES, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('Failed to open IndexedDB'));
    } catch (err) {
      reject(err);
    }
  });
}

export async function getAllPackages() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_PACKAGES, 'readonly');
        const store = tx.objectStore(STORE_PACKAGES);
        const req = store.getAll();
        req.onsuccess = () => {
          const packages = req.result || [];
          const storedIds = new Set(packages.map(pkg => pkg.id));
          resolve([...packages, ...memPackages.filter(pkg => !storedIds.has(pkg.id))]);
        };
        req.onerror = () => resolve([...memPackages]);
      } catch (e) {
        resolve([...memPackages]);
      }
    });
  } catch (err) {
    return [...memPackages];
  }
}

export async function getPackageById(id) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_PACKAGES, 'readonly');
        const store = tx.objectStore(STORE_PACKAGES);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || memPackages.find(pkg => pkg.id === id) || null);
        req.onerror = () => resolve(memPackages.find(p => p.id === id) || null);
      } catch (e) {
        resolve(memPackages.find(p => p.id === id) || null);
      }
    });
  } catch (err) {
    return memPackages.find(p => p.id === id) || null;
  }
}

export async function savePackage(pkg) {
  if (!pkg || !pkg.id) return false;
  // Always update memory fallback
  const idx = memPackages.findIndex(p => p.id === pkg.id);
  if (idx >= 0) memPackages[idx] = pkg;
  else memPackages.push(pkg);

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_PACKAGES, 'readwrite');
        const store = tx.objectStore(STORE_PACKAGES);
        store.put(pkg);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
        tx.onabort = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  } catch (err) {
    return false;
  }
}

export async function deletePackage(id) {
  memPackages = memPackages.filter(p => p.id !== id);
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_PACKAGES, 'readwrite');
        const store = tx.objectStore(STORE_PACKAGES);
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  } catch (err) {
    return true;
  }
}

// --- localStorage for Settings ---
const SETTINGS_KEY = 'belajaryuk_settings';
const DEFAULT_SETTINGS = {
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-3-flash-preview',
  geminiApiKey: '',
  geminiModel: 'gemini-3-flash-preview',
  groqApiKey: '',
  groqModel: 'openai/gpt-oss-20b',
  language: 'id',
  isDemoMode: false
};

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const saved = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      geminiApiKey: saved.geminiApiKey ?? saved.apiKey ?? '',
      geminiModel: saved.geminiModel ?? saved.model ?? DEFAULT_SETTINGS.geminiModel,
      groqModel: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'].includes(saved.groqModel)
        ? DEFAULT_SETTINGS.groqModel
        : saved.groqModel ?? DEFAULT_SETTINGS.groqModel
    };
  } catch (err) {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    const merged = { ...getSettings(), ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    return true;
  } catch (err) {
    console.warn('Failed to save settings to localStorage:', err);
    return false;
  }
}

// --- Export & Import (T-20) ---
export async function exportAllPackagesJson() {
  const pkgs = await getAllPackages();
  return JSON.stringify(pkgs, null, 2);
}

export async function importPackagesJson(jsonString) {
  const parsed = JSON.parse(jsonString);
  if (!Array.isArray(parsed)) throw new Error('Format berkas harus berupa array paket belajar.');
  let imported = 0;
  for (const p of parsed) {
    if (p && p.id && p.title) {
      await savePackage(p);
      imported++;
    }
  }
  return imported;
}

export function exportFlashcardsCsv(flashcards) {
  if (!Array.isArray(flashcards)) return '';
  const rows = [['Depan', 'Belakang', 'Tag']];
  for (const c of flashcards) {
    rows.push([c.front || '', c.back || '', c.tag || 'Umum']);
  }
  return rows.map(r => r.map(col => `"${String(col).replace(/"/g, '""')}"`).join(',')).join('\n');
}

export function downloadBlob(content, filename, mimeType = 'application/json') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
