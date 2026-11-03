// BelajarYuk - State Management (Simple Store with get/set/subscribe)

const DEFAULT_STATE = {
  packages: [],
  currentPackageId: null,
  settings: {
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-3-flash-preview',
    geminiApiKey: '',
    geminiModel: 'gemini-3-flash-preview',
    groqApiKey: '',
    groqModel: 'openai/gpt-oss-20b',
    language: 'id',
    isDemoMode: false
  },
  theme: 'system'
};

let state = { ...DEFAULT_STATE, settings: { ...DEFAULT_STATE.settings } };
const listeners = new Set();

/**
 * Get the current state or a specific property
 * @param {string} [key]
 */
export function get(key) {
  if (key) {
    return state[key];
  }
  return { ...state };
}

/**
 * Update state and notify subscribers
 * Can be called with (key, value) or (partialStateObject)
 * @param {string|object} keyOrPartial
 * @param {*} [value]
 */
export function set(keyOrPartial, value) {
  let changedKey = null;
  if (typeof keyOrPartial === 'string') {
    state = { ...state, [keyOrPartial]: value };
    changedKey = keyOrPartial;
  } else if (keyOrPartial && typeof keyOrPartial === 'object') {
    state = { ...state, ...keyOrPartial };
  }

  for (const listener of listeners) {
    try {
      listener(state, changedKey);
    } catch (err) {
      console.error('State subscriber error:', err);
    }
  }
}

/**
 * Subscribe to state changes
 * @param {Function} callback receives (state, changedKey)
 * @returns {Function} unsubscribe function
 */
export function subscribe(callback) {
  if (typeof callback !== 'function') return () => {};
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Reset state back to default (helpful for testing)
 * @param {object} [custom]
 */
export function resetState(custom) {
  state = custom ? { ...custom } : { ...DEFAULT_STATE, settings: { ...DEFAULT_STATE.settings } };
  listeners.clear();
}
