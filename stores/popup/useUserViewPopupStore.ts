import { create } from "zustand";
import { UserData } from "../useSearchStore";

interface UserViewPopupStore {
  useUserViewPopupState: UserViewPopupData;
  toggleUserViewPopup: (props: UserViewPopupData) => void;
}

interface UserViewPopupData {
  isActOpen: boolean;
  user?: UserData;
}

export const useUserViewPopupStore = create<UserViewPopupStore>((set) => ({
  useUserViewPopupState: {
    isActOpen: false,
  },

  toggleUserViewPopup: (props: UserViewPopupData) => {
    set({ useUserViewPopupState: props });
  },
}));
