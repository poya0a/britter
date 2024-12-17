import { create } from "zustand";

export interface UserData {
  user_id: string;
  user_name: string;
  user_hp: string;
  user_certification: string;
}

interface ResetPasswordState {
  useUserState: UserData;
  saveUserState: (props: UserData) => void;
}

export const useResetPasswordStore = create<ResetPasswordState>((set) => ({
  useUserState: {
    user_id: "",
    user_name: "",
    user_hp: "",
    user_certification: "",
  },

  saveUserState: (props: UserData) => {
    set(() => ({
      useUserState: props,
    }));
  },
}));
