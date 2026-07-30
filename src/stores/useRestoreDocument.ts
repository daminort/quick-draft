import { useEffect } from 'react';

import { loadCurrentDocument } from '~/lib/persistence/indexedDb';

import { useDocumentStore } from '~/stores/useDocumentStore';

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
