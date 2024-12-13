import { useRecoilState } from "recoil";
import { atom } from "recoil";

interface URLPopupData {
  isActOpen: boolean;
  value: {
    URL: string | null;
    label: string | null;
  };
}

export const urlPopupState = atom<URLPopupData>({
  key: "linkPopupState",
  default: {
    isActOpen: false,
    value: {
      URL: null,
      label: null,
    },
  },
});

export const useURLPopup = () => {
  const [useURLPopupState, setUseURLPopupState] =
    useRecoilState<URLPopupData>(urlPopupState);

  const toggleURLPopup = (
    props: boolean | { URL: string | null; label: string | null }
  ) => {
    if (typeof props === "object") {
      setUseURLPopupState({ isActOpen: false, value: props });
    } else {
      setUseURLPopupState({
        isActOpen: true,
        value: { URL: null, label: null },
      });
    }
  };

  return {
    useURLPopupState,
    toggleURLPopup,
  };
};
