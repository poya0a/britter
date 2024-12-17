import { create } from "zustand";

export interface SettingMenuData {
  isActOpen: boolean;
  position: {
    x: number;
    y: number;
  };
}

interface SettingMenuState {
  useSettingMenuState: SettingMenuData;
  toggleSettingMenu: (props: SettingMenuData | boolean) => void;
}

export const useSettingMenuStore = create<SettingMenuState>((set) => ({
  useSettingMenuState: {
    isActOpen: false,
    position: {
      x: 0,
      y: 0,
    },
  },

  toggleSettingMenu: (props: SettingMenuData | boolean) => {
    if (!props) {
      set(() => ({
        useSettingMenuState: {
          isActOpen: false,
          position: {
            x: 0,
            y: 0,
          },
        },
      }));
    } else if (typeof props !== "boolean" && props) {
      set(() => ({
        useSettingMenuState: props,
      }));
    }
  },
}));
