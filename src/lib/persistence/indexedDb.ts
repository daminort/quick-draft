import type { TDocument } from '~/types/document';
import type { TPersistedUISettings } from '~/types/uiSettings';

import {
  DB_NAME,
  DB_VERSION,
  STORE_NAME,
  CURRENT_KEY,
  SETTINGS_STORE_NAME,
  SETTINGS_KEY,
} from '~/constants/persistence';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
        db.createObjectStore(SETTINGS_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error as Error);
  });
}

async function putValue(storeName: string, key: string, value: unknown): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error as Error);
  });
  db.close();
}

async function getValue<T>(storeName: string, key: string): Promise<T | null> {
  const db = await openDatabase();
  const result = await new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).get(key);
    request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
    request.onerror = () => reject(request.error as Error);
  });
  db.close();
  return result;
}

/** Autosaves the whole document under a single fixed key — this app has no multi-document support. */
async function saveCurrentDocument(doc: TDocument): Promise<void> {
  try {
    await putValue(STORE_NAME, CURRENT_KEY, doc);
  } catch (error) {
    console.error('Failed to autosave document', error);
  }
}

async function loadCurrentDocument(): Promise<TDocument | null> {
  try {
    return await getValue<TDocument>(STORE_NAME, CURRENT_KEY);
  } catch (error) {
    console.error('Failed to load autosaved document', error);
    return null;
  }
}

/** Autosaves the UI settings (guides/dimensions/ruler preferences) under a single fixed key. */
async function saveUISettings(settings: TPersistedUISettings): Promise<void> {
  try {
    await putValue(SETTINGS_STORE_NAME, SETTINGS_KEY, settings);
  } catch (error) {
    console.error('Failed to autosave UI settings', error);
  }
}

async function loadUISettings(): Promise<Partial<TPersistedUISettings> | null> {
  try {
    return await getValue<Partial<TPersistedUISettings>>(SETTINGS_STORE_NAME, SETTINGS_KEY);
  } catch (error) {
    console.error('Failed to load autosaved UI settings', error);
    return null;
  }
}

export { saveCurrentDocument, loadCurrentDocument, saveUISettings, loadUISettings };
