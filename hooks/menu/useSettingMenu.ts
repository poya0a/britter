import { useRecoilState } from "recoil";
import { atom } from "recoil";

export interface SettingMenuData {
  isActOpen: boolean;
  position: {
    x: number;
    y: number;
  };
}

export const settingMenuState = atom<SettingMenuData>({
  key: "settingMenuState",
  default: {
    isActOpen: false,
    position: {
      x: 0,
      y: 0,
    },
  },
});

export const useSettingMenu = () => {
  const [useSettingMenuState, setUseSettingMenuState] =
    useRecoilState<SettingMenuData>(settingMenuState);

  const toggleSettingMenu = (props: SettingMenuData | boolean) => {
    if (!props) {
      setUseSettingMenuState({
        isActOpen: false,
        position: {
          x: 0,
          y: 0,
        },
      });
    } else if (typeof props !== "boolean" && props) {
      setUseSettingMenuState(props);
    }
  };

  return {
    useSettingMenuState,
    toggleSettingMenu,
  };
};
