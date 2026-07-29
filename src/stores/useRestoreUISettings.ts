import { useEffect } from 'react'
import { useUIStore } from '~/stores/useUIStore'
import { loadUISettings } from '~/lib/persistence/indexedDb'

/** Restores the last autosaved UI settings (if any) once, on mount. */
export function useRestoreUISettings() {
  useEffect(() => {
    let cancelled = false
    loadUISettings().then((settings) => {
      if (cancelled || !settings) return
      useUIStore.getState().hydrateSettings(settings)
    })
    return () => {
      cancelled = true
    }
  }, [])
}
