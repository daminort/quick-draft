import { useEffect } from 'react';

import { loadCurrentDocument } from '~/lib/persistence/indexedDb';

import { documentActions } from '~/stores/documentStore';

export function useRestoreDocument() {
  useEffect(() => {
    let cancelled = false;
    loadCurrentDocument().then(doc => {
      if (cancelled || !doc) {
        return;
      }
      documentActions.loadDocument(doc);
    });
    return () => {
      cancelled = true;
    };
  }, []);
}
