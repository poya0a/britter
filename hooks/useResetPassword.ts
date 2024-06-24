import { useState } from "react";
import { useRecoilState } from "recoil";
import { atom } from "recoil";

export interface UserData {
  user_id: string;
  user_name: string;
  user_hp: string;
  user_certification: string;
}

export const usersState = atom<UserData>({
  key: "usersState",
  default: {
    user_id: "",
    user_name: "",
    user_hp: "",
    user_certification: "",
  },
});

export const useResetPassword = () => {
  const [useUserState, setUseUserState] = useRecoilState<UserData>(usersState);

  const saveUserState = async (props: UserData) => {
    setUseUserState(props);
  };

  return {
    useUserState,
    saveUserState,
  };
};
