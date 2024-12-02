import { useRecoilState } from "recoil";
import { atom } from "recoil";

interface URLPopupData {
  isActOpen: boolean;
  url: string;
}

export const urlPopupState = atom<URLPopupData>({
  key: "linkPopupState",
  default: {
    isActOpen: false,
    url: "",
  },
});

export const useURLPopup = () => {
  const [useURLPopupState, setUseURLPopupState] =
    useRecoilState<URLPopupData>(urlPopupState);

  const toggleURLPopup = (props: string | boolean) => {
    if (typeof props === "string") {
      setUseURLPopupState({ isActOpen: false, url: props });
    } else {
      setUseURLPopupState({ isActOpen: true, url: "" });
    }
  };

  return {
    useURLPopupState,
    toggleURLPopup,
  };
};
