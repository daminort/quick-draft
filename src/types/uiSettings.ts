/** The subset of useUIStore state that's a user preference (vs. transient panel-open state) and gets autosaved to IndexedDB. */
export type TPersistedUISettings = {
  guidesVisible: boolean;
  snapTolerance: number;
  showDimensionUnit: boolean;
  dimensionsVisible: boolean;
  dimensionColor: string;
  rulerVisible: boolean;
  rulerGuidesVisible: boolean;
};
