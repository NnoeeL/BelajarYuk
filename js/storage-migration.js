const LEGACY_PREFIX = 'belajaryuk_';
const CURRENT_PREFIX = 'arsipbelajar_';

export function migrateLegacyLocalStorage() {
  try {
    const legacyKeys = [];
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (key?.startsWith(LEGACY_PREFIX)) legacyKeys.push(key);
    }

    legacyKeys.forEach(legacyKey => {
      const currentKey = `${CURRENT_PREFIX}${legacyKey.slice(LEGACY_PREFIX.length)}`;
      const legacyValue = localStorage.getItem(legacyKey);
      if (localStorage.getItem(currentKey) === null && legacyValue !== null) {
        localStorage.setItem(currentKey, legacyValue);
      }
      localStorage.removeItem(legacyKey);
    });
    return true;
  } catch (error) {
    console.warn('Gagal memigrasikan kunci penyimpanan ArsipBelajar:', error);
    return false;
  }
}
