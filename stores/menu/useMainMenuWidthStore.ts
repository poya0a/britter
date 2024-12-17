import { create } from "zustand";

interface MainMenuWidthState {
  useMainMenuWidthState: number;
  handleMainMenuWidth: (width: number) => void;
}

export const useMainMenuWidthStore = create<MainMenuWidthState>((set) => ({
  useMainMenuWidthState: 240,

  handleMainMenuWidth: (width: number) => {
    set(() => ({
      useMainMenuWidthState: width,
    }));
  },
}));
