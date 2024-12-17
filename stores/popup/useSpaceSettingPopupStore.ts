import { create } from "zustand";

interface SpaceSettingData {
  isActOpen: boolean;
  mode: string;
}

interface SpaceSettingPopupStore {
  useSpaceSettingState: SpaceSettingData;
  toggleSpaceSettingPopup: (props: SpaceSettingData | boolean) => void;
}

export const useSpaceSettingPopupStore = create<SpaceSettingPopupStore>(
  (set) => ({
    useSpaceSettingState: {
      isActOpen: false,
      mode: "",
    },

    toggleSpaceSettingPopup: (props: SpaceSettingData | boolean) => {
      if (!props) {
        set({ useSpaceSettingState: { isActOpen: false, mode: "" } });
      } else if (typeof props !== "boolean" && props) {
        set({
          useSpaceSettingState: {
            isActOpen: props.isActOpen,
            mode: props.mode,
          },
        });
      }
    },
  })
);
