import { useRecoilState } from "recoil";
import { atom } from "recoil";

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

  const toggleUserSettingPopup = async (props: UserSettingPopupData) => {
    setUseUserSettingPopupState(props);
  };

  return {
    useUserSettingPopupState,
    toggleUserSettingPopup,
  };
};
