/** IndexedDB database name for document autosave. Used in: lib/persistence/indexedDb.ts */
export const DB_NAME = 'quick-draft'

/** IndexedDB schema version. Used in: lib/persistence/indexedDb.ts */
export const DB_VERSION = 1

/** IndexedDB object store name holding the autosaved document. Used in: lib/persistence/indexedDb.ts */
export const STORE_NAME = 'documents'

/** Fixed IndexedDB key the single autosaved document is stored under (app has no multi-document support). Used in: lib/persistence/indexedDb.ts */
export const CURRENT_KEY = 'current'

/** Debounce delay (ms) before persisting a document change to IndexedDB. Used in: stores/useDocumentStore.ts */
export const AUTOSAVE_DEBOUNCE_MS = 800
