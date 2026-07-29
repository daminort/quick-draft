import { create } from 'zustand';

import type { TPersistedUISettings } from '~/types/uiSettings';

import { SNAP_TOLERANCE_PX } from '~/constants/canvas';
import { DEFAULT_DIMENSION_COLOR } from '~/constants/dimension';
import { AUTOSAVE_DEBOUNCE_MS } from '~/constants/persistence';

import { saveUISettings } from '~/lib/persistence/indexedDb';

type TUIStore = {
  isSettingsOpen: boolean;
  toggleSettings: () => void;
  isLibraryOpen: boolean;
  toggleLibrary: () => void;
  areGuidesVisible: boolean;
  toggleGuidesVisible: () => void;
  snapTolerance: number;
  setSnapTolerance: (tolerance: number) => void;
  shouldShowDimensionUnit: boolean;
  toggleShowDimensionUnit: () => void;
  areDimensionsVisible: boolean;
  toggleDimensionsVisible: () => void;
  dimensionColor: string;
  setDimensionColor: (color: string) => void;
  isRulerVisible: boolean;
  toggleRulerVisible: () => void;
  areRulerGuidesVisible: boolean;
  toggleRulerGuidesVisible: () => void;
  isPrintOpen: boolean;
  openPrint: () => void;
  closePrint: () => void;
  hydrateSettings: (settings: Partial<TPersistedUISettings>) => void;
};

export const useUIStore = create<TUIStore>()(set => ({
  isSettingsOpen: false,
  toggleSettings: () =>
    set(state => ({ isSettingsOpen: !state.isSettingsOpen, isLibraryOpen: false })),
  isLibraryOpen: false,
  toggleLibrary: () =>
    set(state => ({ isLibraryOpen: !state.isLibraryOpen, isSettingsOpen: false })),
  areGuidesVisible: true,
  toggleGuidesVisible: () => set(state => ({ areGuidesVisible: !state.areGuidesVisible })),
  snapTolerance: SNAP_TOLERANCE_PX,
  setSnapTolerance: tolerance => set({ snapTolerance: Math.max(0, tolerance) }),
  shouldShowDimensionUnit: false,
  toggleShowDimensionUnit: () =>
    set(state => ({ shouldShowDimensionUnit: !state.shouldShowDimensionUnit })),
  areDimensionsVisible: true,
  toggleDimensionsVisible: () =>
    set(state => ({ areDimensionsVisible: !state.areDimensionsVisible })),
  dimensionColor: DEFAULT_DIMENSION_COLOR,
  setDimensionColor: color => set({ dimensionColor: color }),
  isRulerVisible: false,
  toggleRulerVisible: () => set(state => ({ isRulerVisible: !state.isRulerVisible })),
  areRulerGuidesVisible: false,
  toggleRulerGuidesVisible: () =>
    set(state => ({ areRulerGuidesVisible: !state.areRulerGuidesVisible })),
  isPrintOpen: false,
  openPrint: () => set({ isPrintOpen: true }),
  closePrint: () => set({ isPrintOpen: false }),
  hydrateSettings: settings => set(settings),
}));

function pickPersistedSettings(state: TUIStore): TPersistedUISettings {
  return {
    areGuidesVisible: state.areGuidesVisible,
    snapTolerance: state.snapTolerance,
    shouldShowDimensionUnit: state.shouldShowDimensionUnit,
    areDimensionsVisible: state.areDimensionsVisible,
    dimensionColor: state.dimensionColor,
    isRulerVisible: state.isRulerVisible,
    areRulerGuidesVisible: state.areRulerGuidesVisible,
  };
}

let settingsAutosaveTimer: ReturnType<typeof setTimeout> | undefined;
useUIStore.subscribe(state => {
  if (settingsAutosaveTimer) {
    clearTimeout(settingsAutosaveTimer);
  }
  settingsAutosaveTimer = setTimeout(() => {
    void saveUISettings(pickPersistedSettings(state));
  }, AUTOSAVE_DEBOUNCE_MS);
});
