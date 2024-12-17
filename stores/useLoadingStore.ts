import { create } from "zustand";

interface LoadingState {
  isLoading: boolean;
  toggleLoading: (state: boolean) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,

  toggleLoading: (state: boolean) => set({ isLoading: state }),
}));
