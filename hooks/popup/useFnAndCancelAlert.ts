import { useRecoilState } from "recoil";
import { atom } from "recoil";

interface FnAndCancelAlertData {
  isActOpen: boolean;
  content: string;
  fn: Function;
}

export const fnAndCancelAlertState = atom<FnAndCancelAlertData>({
  key: "fnAndCancelAlertState",
  default: {
    isActOpen: false,
    content: "",
    fn: () => {},
  },
});

export const useFnAndCancelAlert = () => {
  const [useFnAndCancelAlertState, setUseFnAndCancelAlertState] =
    useRecoilState<FnAndCancelAlertData>(fnAndCancelAlertState);

  const toggleFnAndCancelAlert = (props: FnAndCancelAlertData) => {
    setUseFnAndCancelAlertState({
      isActOpen: props.isActOpen,
      content: props.content,
      fn: props.fn,
    });
  };

  return {
    useFnAndCancelAlertState,
    toggleFnAndCancelAlert,
  };
};
