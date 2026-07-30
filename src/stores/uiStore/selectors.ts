import type { TUIState } from './types';

export const uiSelectors = {
  getIsSettingsOpen: (state: TUIState) => state.isSettingsOpen,
  getIsLibraryOpen: (state: TUIState) => state.isLibraryOpen,
  getAreGuidesVisible: (state: TUIState) => state.areGuidesVisible,
  getSnapTolerance: (state: TUIState) => state.snapTolerance,
  getShouldShowDimensionUnit: (state: TUIState) => state.shouldShowDimensionUnit,
  getAreDimensionsVisible: (state: TUIState) => state.areDimensionsVisible,
  getDimensionColor: (state: TUIState) => state.dimensionColor,
  getIsRulerVisible: (state: TUIState) => state.isRulerVisible,
  getAreRulerGuidesVisible: (state: TUIState) => state.areRulerGuidesVisible,
  getIsPrintOpen: (state: TUIState) => state.isPrintOpen,
};
