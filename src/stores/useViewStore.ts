import { create } from 'zustand';

type TViewState = {
  scale: number;
  x: number;
  y: number;
};

type TViewStore = TViewState & {
  setView: (view: TViewState) => void;
  resetZoom: () => void;
};

export const useViewStore = create<TViewStore>()(set => ({
  scale: 1,
  x: 0,
  y: 0,
  setView: view => set(view),
  resetZoom: () => set({ scale: 1, x: 0, y: 0 }),
}));
