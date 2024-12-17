import { create } from "zustand";

interface UserSettingPopupStore {
  useUserSettingPopupState: boolean;
  toggleUserSettingPopup: (props: boolean) => void;
}

export const useUserSettingPopupStore = create<UserSettingPopupStore>(
  (set) => ({
    useUserSettingPopupState: false,

    toggleUserSettingPopup: (props: boolean) => {
      set({ useUserSettingPopupState: props });
    },
  })
);
