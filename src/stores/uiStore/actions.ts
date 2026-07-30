import type { TPersistedUISettings } from '~/types/uiSettings';

import { uiStore } from './store';

export const uiActions = {
  toggleSettings: () => {
    uiStore.setState(state => ({ isSettingsOpen: !state.isSettingsOpen, isLibraryOpen: false }));
  },
  toggleLibrary: () => {
    uiStore.setState(state => ({ isLibraryOpen: !state.isLibraryOpen, isSettingsOpen: false }));
  },
  toggleGuidesVisible: () => {
    uiStore.setState(state => ({ areGuidesVisible: !state.areGuidesVisible }));
  },
  setSnapTolerance: (tolerance: number) => {
    uiStore.setState({ snapTolerance: Math.max(0, tolerance) });
  },
  toggleShowDimensionUnit: () => {
    uiStore.setState(state => ({ shouldShowDimensionUnit: !state.shouldShowDimensionUnit }));
  },
  toggleDimensionsVisible: () => {
    uiStore.setState(state => ({ areDimensionsVisible: !state.areDimensionsVisible }));
  },
  setDimensionColor: (color: string) => {
    uiStore.setState({ dimensionColor: color });
  },
  toggleRulerVisible: () => {
    uiStore.setState(state => ({ isRulerVisible: !state.isRulerVisible }));
  },
  toggleRulerGuidesVisible: () => {
    uiStore.setState(state => ({ areRulerGuidesVisible: !state.areRulerGuidesVisible }));
  },
  openPrint: () => {
    uiStore.setState({ isPrintOpen: true });
  },
  closePrint: () => {
    uiStore.setState({ isPrintOpen: false });
  },
  hydrateSettings: (settings: Partial<TPersistedUISettings>) => {
    uiStore.setState(settings);
  },
};
