import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import { useRecoilState } from "recoil";
import { atom } from "recoil";
import { UserData } from "../useSearch";

interface UserViewPopupData {
  isActOpen: boolean;
  user?: UserData;
}

export const userViewPopupState = atom<UserViewPopupData>({
  key: "userViewPopupState",
  default: {
    isActOpen: false,
  },
});

export const useUserViewPopup = () => {
  const [useUserViewPopupState, setUseUseViewrPopupState] =
    useRecoilState<UserViewPopupData>(userViewPopupState);

  const toggleUserViewPopup = async (props: UserViewPopupData) => {
    setUseUseViewrPopupState(props);
  };

  return {
    useUserViewPopupState,
    toggleUserViewPopup,
  };
};
