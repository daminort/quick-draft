import { useEffect } from 'react';

import { loadUISettings } from '~/lib/persistence/indexedDb';

import { useUIStore } from '~/stores/useUIStore';

export function useRestoreUISettings() {
  useEffect(() => {
    let cancelled = false;
    loadUISettings().then(settings => {
      if (cancelled || !settings) {
        return;
      }
      useUIStore.getState().hydrateSettings(settings);
    });
    return () => {
      cancelled = true;
    };
  }, []);
}
