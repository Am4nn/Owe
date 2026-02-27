import { create } from 'zustand'
import { colorScheme } from 'nativewind'

// Force dark mode on app launch (UIUX-01)
// This runs at module import time, before any component mounts
colorScheme.set('dark')

interface UIStore {
  isBottomSheetOpen: boolean
  activeGroupId: string | null
  setBottomSheetOpen: (open: boolean) => void
  setActiveGroupId: (id: string | null) => void
}

export const useUIStore = create<UIStore>((set) => ({
  isBottomSheetOpen: false,
  activeGroupId: null,
  setBottomSheetOpen: (open) => set({ isBottomSheetOpen: open }),
  setActiveGroupId: (id) => set({ activeGroupId: id }),
}))
