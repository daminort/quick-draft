export const DB_NAME = 'quick-draft';

/** Bump when adding an object store so `onupgradeneeded` creates it for existing users. */
export const DB_VERSION = 2;

export const STORE_NAME = 'documents';

/** Fixed key — this app has no multi-document support. */
export const CURRENT_KEY = 'current';

export const SETTINGS_STORE_NAME = 'settings';

export const SETTINGS_KEY = 'ui';

export const AUTOSAVE_DEBOUNCE_MS = 800;
