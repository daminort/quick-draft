type TTool =
  'select' | 'move' | 'line' | 'rect' | 'circle' | 'arc' | 'text' | 'guide' | 'dimension' | 'ruler';

type TToolState = {
  activeTool: TTool;
};

export type { TTool, TToolState };
