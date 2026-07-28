import { create } from 'zustand'

export const MIN_SCALE = 0.1
export const MAX_SCALE = 5

interface ViewState {
  scale: number
  x: number
  y: number
}

interface ViewStore extends ViewState {
  setView: (view: ViewState) => void
  resetZoom: () => void
}

export const useViewStore = create<ViewStore>()((set) => ({
  scale: 1,
  x: 0,
  y: 0,
  setView: (view) => set(view),
  resetZoom: () => set({ scale: 1, x: 0, y: 0 }),
}))
