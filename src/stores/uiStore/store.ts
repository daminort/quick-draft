import { create } from 'zustand';

import type { TPersistedUISettings } from '~/types/uiSettings';

import { SNAP_TOLERANCE_PX } from '~/constants/canvas';
import { DEFAULT_DIMENSION_COLOR } from '~/constants/dimension';
import { AUTOSAVE_DEBOUNCE_MS } from '~/constants/persistence';

import { saveUISettings } from '~/lib/persistence/indexedDb';

import type { TUIState } from './types';

export const uiStore = create<TUIState>()(() => ({
  isSettingsOpen: false,
  isLibraryOpen: false,
  areGuidesVisible: true,
  snapTolerance: SNAP_TOLERANCE_PX,
  shouldShowDimensionUnit: false,
  areDimensionsVisible: true,
  dimensionColor: DEFAULT_DIMENSION_COLOR,
  isRulerVisible: false,
  areRulerGuidesVisible: false,
  isPrintOpen: false,
}));

function pickPersistedSettings(state: TUIState): TPersistedUISettings {
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
uiStore.subscribe(state => {
  if (settingsAutosaveTimer) {
    clearTimeout(settingsAutosaveTimer);
  }
  settingsAutosaveTimer = setTimeout(() => {
    void saveUISettings(pickPersistedSettings(state));
  }, AUTOSAVE_DEBOUNCE_MS);
});
