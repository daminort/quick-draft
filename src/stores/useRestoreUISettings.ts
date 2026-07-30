import { useEffect } from 'react';

import { loadUISettings } from '~/lib/persistence/indexedDb';

import { uiActions } from '~/stores/uiStore';

function useRestoreUISettings() {
  useEffect(() => {
    let cancelled = false;
    loadUISettings().then(settings => {
      if (cancelled || !settings) {
        return;
      }
      uiActions.hydrateSettings(settings);
    });
    return () => {
      cancelled = true;
    };
  }, []);
}

export { useRestoreUISettings };
