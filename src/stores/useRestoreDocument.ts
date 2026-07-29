import { useEffect } from 'react';

import { loadCurrentDocument } from '~/lib/persistence/indexedDb';

import { useDocumentStore } from '~/stores/useDocumentStore';

/** Restores the last autosaved document (if any) once, on mount. */
export function useRestoreDocument() {
  useEffect(() => {
    let cancelled = false;
    loadCurrentDocument().then(doc => {
      if (cancelled || !doc) {
        return;
      }
      useDocumentStore.getState().loadDocument(doc);
    });
    return () => {
      cancelled = true;
    };
  }, []);
}
