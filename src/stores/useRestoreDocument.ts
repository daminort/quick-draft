import { useEffect } from 'react'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { loadCurrentDocument } from '~/lib/persistence/indexedDb'

/** Restores the last autosaved document (if any) once, on mount. */
export function useRestoreDocument() {
  useEffect(() => {
    let cancelled = false
    loadCurrentDocument().then((doc) => {
      if (cancelled || !doc) return
      useDocumentStore.getState().loadDocument(doc)
    })
    return () => {
      cancelled = true
    }
  }, [])
}
