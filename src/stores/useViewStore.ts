import { create } from 'zustand'

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
