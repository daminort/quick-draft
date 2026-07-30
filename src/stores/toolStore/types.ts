type TTool =
  'select' | 'line' | 'rect' | 'circle' | 'arc' | 'text' | 'guide' | 'dimension' | 'ruler';

type TToolState = {
  activeTool: TTool;
};

export type { TTool, TToolState };
