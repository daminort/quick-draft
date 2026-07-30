const DB_NAME = 'quick-draft';

/** Bump when adding an object store so `onupgradeneeded` creates it for existing users. */
const DB_VERSION = 2;

const STORE_NAME = 'documents';

/** Fixed key — this app has no multi-document support. */
const CURRENT_KEY = 'current';

const SETTINGS_STORE_NAME = 'settings';

const SETTINGS_KEY = 'ui';

const AUTOSAVE_DEBOUNCE_MS = 800;

export {
  DB_NAME,
  DB_VERSION,
  STORE_NAME,
  CURRENT_KEY,
  SETTINGS_STORE_NAME,
  SETTINGS_KEY,
  AUTOSAVE_DEBOUNCE_MS,
};
