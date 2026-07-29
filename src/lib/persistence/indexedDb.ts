import type { Document } from '~/types/document'
import { DB_NAME, DB_VERSION, STORE_NAME, CURRENT_KEY } from '~/constants/persistence'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error as Error)
  })
}

/** Autosaves the whole document under a single fixed key — this app has no multi-document support. */
export async function saveCurrentDocument(doc: Document): Promise<void> {
  try {
    const db = await openDatabase()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(doc, CURRENT_KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error as Error)
    })
    db.close()
  } catch (error) {
    console.error('Failed to autosave document', error)
  }
}

export async function loadCurrentDocument(): Promise<Document | null> {
  try {
    const db = await openDatabase()
    const result = await new Promise<Document | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const request = tx.objectStore(STORE_NAME).get(CURRENT_KEY)
      request.onsuccess = () => resolve((request.result as Document | undefined) ?? null)
      request.onerror = () => reject(request.error as Error)
    })
    db.close()
    return result
  } catch (error) {
    console.error('Failed to load autosaved document', error)
    return null
  }
}
