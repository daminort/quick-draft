/** The subset of useUIStore state that's a user preference (vs. transient panel-open state) and gets autosaved to IndexedDB. */
export type TPersistedUISettings = {
  areGuidesVisible: boolean;
  snapTolerance: number;
  shouldShowDimensionUnit: boolean;
  areDimensionsVisible: boolean;
  dimensionColor: string;
  isRulerVisible: boolean;
  areRulerGuidesVisible: boolean;
};
