import { create } from "zustand";

interface ScrollLockState {
  isLocked: boolean;
  toggleScrollLock: (lock: boolean) => void;
}

export const useScrollLockStore = create<ScrollLockState>((set) => ({
  isLocked: false,

  toggleScrollLock: (lock: boolean) => set({ isLocked: lock }),
}));
