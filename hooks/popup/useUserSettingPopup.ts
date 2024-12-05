import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import { useRecoilState } from "recoil";
import { atom } from "recoil";
import { useAlert } from "./useAlert";
import { useToast } from "./useToast";

interface UserSettingPopupData {
  isActOpen: boolean;
}

export const userSettingPopupState = atom<UserSettingPopupData>({
  key: "userSettingPopupState",
  default: {
    isActOpen: false,
  },
});

export const useUserSettingPopup = () => {
  const [useUserSettingPopupState, setUseUserSettingPopupState] =
    useRecoilState<UserSettingPopupData>(userSettingPopupState);
  const { toggleAlert } = useAlert();
  const { setToast } = useToast();

  const toggleUserSettingPopup = async (props: UserSettingPopupData) => {
    setUseUserSettingPopupState(props);
  };

  return {
    useUserSettingPopupState,
    toggleUserSettingPopup,
  };
};
