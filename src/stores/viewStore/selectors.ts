import type { TViewState } from './types';

export const viewSelectors = {
  getScale: (state: TViewState) => state.scale,
  getX: (state: TViewState) => state.x,
  getY: (state: TViewState) => state.y,
};
