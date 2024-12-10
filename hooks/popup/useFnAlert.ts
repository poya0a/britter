import { useRecoilState } from "recoil";
import { atom } from "recoil";

interface FnAlertData {
  isActOpen: boolean;
  content: string;
  fn: Function;
}

export const fnAlertState = atom<FnAlertData>({
  key: "fnAlertState",
  default: {
    isActOpen: false,
    content: "",
    fn: () => {},
  },
});

export const useFnAlert = () => {
  const [useFnAlertState, setUseFnAlertState] =
    useRecoilState<FnAlertData>(fnAlertState);

  const toggleFnAlert = (props: FnAlertData) => {
    setUseFnAlertState({
      isActOpen: props.isActOpen,
      content: props.content,
      fn: props.fn,
    });
  };

  return {
    useFnAlertState,
    toggleFnAlert,
  };
};
