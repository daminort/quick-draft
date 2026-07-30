export type TTool =
  'select' | 'line' | 'rect' | 'circle' | 'arc' | 'text' | 'guide' | 'dimension' | 'ruler';

export type TToolState = {
  activeTool: TTool;
};
