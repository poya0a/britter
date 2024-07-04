import { useRecoilState } from "recoil";
import { atom } from "recoil";

interface ToastData {
  isActOpen: boolean;
  content: string;
}

export const toastState = atom<ToastData>({
  key: "toastState",
  default: {
    isActOpen: false,
    content: "",
  },
});

export const useToast = () => {
  const [useToastState, setUseToastState] =
    useRecoilState<ToastData>(toastState);

  const setToast = (content: string) => {
    setUseToastState({ isActOpen: true, content: content });

    setTimeout(() => {
      setUseToastState({ isActOpen: false, content: "" });
    }, 3000);
  };

  return {
    useToastState,
    setToast,
  };
};
