/** IndexedDB database name for document autosave. Used in: lib/persistence/indexedDb.ts */
export const DB_NAME = 'quick-draft';

/** IndexedDB schema version. Bump when adding an object store so onupgradeneeded creates it for existing users. Used in: lib/persistence/indexedDb.ts */
export const DB_VERSION = 2;

/** IndexedDB object store name holding the autosaved document. Used in: lib/persistence/indexedDb.ts */
export const STORE_NAME = 'documents';

/** Fixed IndexedDB key the single autosaved document is stored under (app has no multi-document support). Used in: lib/persistence/indexedDb.ts */
export const CURRENT_KEY = 'current';

/** IndexedDB object store name holding the autosaved UI settings. Used in: lib/persistence/indexedDb.ts */
export const SETTINGS_STORE_NAME = 'settings';

/** Fixed IndexedDB key the single autosaved settings object is stored under. Used in: lib/persistence/indexedDb.ts */
export const SETTINGS_KEY = 'ui';

/** Debounce delay (ms) before persisting a document/settings change to IndexedDB. Used in: stores/useDocumentStore.ts, stores/useUIStore.ts */
export const AUTOSAVE_DEBOUNCE_MS = 800;
