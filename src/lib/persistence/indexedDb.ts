import type { Document } from '~/types/document'
import type { PersistedUISettings } from '~/types/uiSettings'
import {
  DB_NAME,
  DB_VERSION,
  STORE_NAME,
  CURRENT_KEY,
  SETTINGS_STORE_NAME,
  SETTINGS_KEY,
} from '~/constants/persistence'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
        db.createObjectStore(SETTINGS_STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error as Error)
  })
}

async function putValue(storeName: string, key: string, value: unknown): Promise<void> {
  const db = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error as Error)
  })
  db.close()
}

async function getValue<T>(storeName: string, key: string): Promise<T | null> {
  const db = await openDatabase()
  const result = await new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const request = tx.objectStore(storeName).get(key)
    request.onsuccess = () => resolve((request.result as T | undefined) ?? null)
    request.onerror = () => reject(request.error as Error)
  })
  db.close()
  return result
}

/** Autosaves the whole document under a single fixed key — this app has no multi-document support. */
export async function saveCurrentDocument(doc: Document): Promise<void> {
  try {
    await putValue(STORE_NAME, CURRENT_KEY, doc)
  } catch (error) {
    console.error('Failed to autosave document', error)
  }
}

export async function loadCurrentDocument(): Promise<Document | null> {
  try {
    return await getValue<Document>(STORE_NAME, CURRENT_KEY)
  } catch (error) {
    console.error('Failed to load autosaved document', error)
    return null
  }
}

/** Autosaves the UI settings (guides/dimensions/ruler preferences) under a single fixed key. */
export async function saveUISettings(settings: PersistedUISettings): Promise<void> {
  try {
    await putValue(SETTINGS_STORE_NAME, SETTINGS_KEY, settings)
  } catch (error) {
    console.error('Failed to autosave UI settings', error)
  }
}

export async function loadUISettings(): Promise<Partial<PersistedUISettings> | null> {
  try {
    return await getValue<Partial<PersistedUISettings>>(SETTINGS_STORE_NAME, SETTINGS_KEY)
  } catch (error) {
    console.error('Failed to load autosaved UI settings', error)
    return null
  }
}
