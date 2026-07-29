import { create } from 'zustand'
import { SNAP_TOLERANCE_PX } from '~/constants/canvas'

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
  rulerVisible: boolean
  toggleRulerVisible: () => void
  rulerGuidesVisible: boolean
  toggleRulerGuidesVisible: () => void
  printOpen: boolean
  openPrint: () => void
  closePrint: () => void
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
  rulerVisible: false,
  toggleRulerVisible: () => set((state) => ({ rulerVisible: !state.rulerVisible })),
  rulerGuidesVisible: false,
  toggleRulerGuidesVisible: () =>
    set((state) => ({ rulerGuidesVisible: !state.rulerGuidesVisible })),
  printOpen: false,
  openPrint: () => set({ printOpen: true }),
  closePrint: () => set({ printOpen: false }),
}))
