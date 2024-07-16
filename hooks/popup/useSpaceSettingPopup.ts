import { useRecoilState } from "recoil";
import { atom } from "recoil";

interface SpaceSettingData {
  isActOpen: boolean;
  mode: string;
}

export const spaceSettingState = atom<SpaceSettingData>({
  key: "spaceSettingState",
  default: {
    isActOpen: false,
    mode: "",
  },
});

export const useSpaceSettingPopup = () => {
  const [useSpaceSettingState, setUseSpaceSettingState] =
    useRecoilState<SpaceSettingData>(spaceSettingState);

  const toggleSpaceSettingPopup = (props: SpaceSettingData | boolean) => {
    if (!props) {
      setUseSpaceSettingState({ isActOpen: false, mode: "" });
    } else if (typeof props !== "boolean" && props) {
      setUseSpaceSettingState({ isActOpen: props.isActOpen, mode: props.mode });
    }
  };

  return {
    useSpaceSettingState,
    toggleSpaceSettingPopup,
  };
};
