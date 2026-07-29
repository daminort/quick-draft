import { create } from 'zustand'
import { SNAP_TOLERANCE_PX } from '~/constants/canvas'
import { DEFAULT_DIMENSION_COLOR } from '~/constants/dimension'
import { AUTOSAVE_DEBOUNCE_MS } from '~/constants/persistence'
import { saveUISettings } from '~/lib/persistence/indexedDb'
import type { PersistedUISettings } from '~/types/uiSettings'

interface UIStore {
  settingsOpen: boolean
  toggleSettings: () => void
  libraryOpen: boolean
  toggleLibrary: () => void
  guidesVisible: boolean
  toggleGuidesVisible: () => void
  snapTolerance: number
  setSnapTolerance: (tolerance: number) => void
  showDimensionUnit: boolean
  toggleShowDimensionUnit: () => void
  dimensionsVisible: boolean
  toggleDimensionsVisible: () => void
  dimensionColor: string
  setDimensionColor: (color: string) => void
  rulerVisible: boolean
  toggleRulerVisible: () => void
  rulerGuidesVisible: boolean
  toggleRulerGuidesVisible: () => void
  printOpen: boolean
  openPrint: () => void
  closePrint: () => void
  hydrateSettings: (settings: Partial<PersistedUISettings>) => void
}

export const useUIStore = create<UIStore>()((set) => ({
  settingsOpen: false,
  toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen, libraryOpen: false })),
  libraryOpen: false,
  toggleLibrary: () => set((state) => ({ libraryOpen: !state.libraryOpen, settingsOpen: false })),
  guidesVisible: true,
  toggleGuidesVisible: () => set((state) => ({ guidesVisible: !state.guidesVisible })),
  snapTolerance: SNAP_TOLERANCE_PX,
  setSnapTolerance: (tolerance) => set({ snapTolerance: Math.max(0, tolerance) }),
  showDimensionUnit: false,
  toggleShowDimensionUnit: () => set((state) => ({ showDimensionUnit: !state.showDimensionUnit })),
  dimensionsVisible: true,
  toggleDimensionsVisible: () => set((state) => ({ dimensionsVisible: !state.dimensionsVisible })),
  dimensionColor: DEFAULT_DIMENSION_COLOR,
  setDimensionColor: (color) => set({ dimensionColor: color }),
  rulerVisible: false,
  toggleRulerVisible: () => set((state) => ({ rulerVisible: !state.rulerVisible })),
  rulerGuidesVisible: false,
  toggleRulerGuidesVisible: () =>
    set((state) => ({ rulerGuidesVisible: !state.rulerGuidesVisible })),
  printOpen: false,
  openPrint: () => set({ printOpen: true }),
  closePrint: () => set({ printOpen: false }),
  hydrateSettings: (settings) => set(settings),
}))

function pickPersistedSettings(state: UIStore): PersistedUISettings {
  return {
    guidesVisible: state.guidesVisible,
    snapTolerance: state.snapTolerance,
    showDimensionUnit: state.showDimensionUnit,
    dimensionsVisible: state.dimensionsVisible,
    dimensionColor: state.dimensionColor,
    rulerVisible: state.rulerVisible,
    rulerGuidesVisible: state.rulerGuidesVisible,
  }
}

let settingsAutosaveTimer: ReturnType<typeof setTimeout> | undefined
useUIStore.subscribe((state) => {
  if (settingsAutosaveTimer) clearTimeout(settingsAutosaveTimer)
  settingsAutosaveTimer = setTimeout(() => {
    void saveUISettings(pickPersistedSettings(state))
  }, AUTOSAVE_DEBOUNCE_MS)
})
