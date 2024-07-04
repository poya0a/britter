import { useRecoilState } from "recoil";
import { atom } from "recoil";

interface AlertData {
  isActOpen: boolean;
  content: string;
}

export const alertState = atom<AlertData>({
  key: "alertState",
  default: {
    isActOpen: false,
    content: "",
  },
});

export const useAlert = () => {
  const [useAlertState, setUseAlertState] =
    useRecoilState<AlertData>(alertState);

  const toggleAlert = (props: string | boolean) => {
    if (typeof props === "string") {
      setUseAlertState({ isActOpen: true, content: props });
    } else {
      setUseAlertState({ isActOpen: false, content: "" });
    }
  };

  return {
    useAlertState,
    toggleAlert,
  };
};
