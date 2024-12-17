import { create } from "zustand";

interface FnAlertData {
  isActOpen: boolean;
  content: string;
  fn: Function;
}

interface FnAlertState {
  useFnAlertState: FnAlertData;
  toggleFnAlert: (props: FnAlertData) => void;
}

export const useFnAlertStore = create<FnAlertState>((set) => ({
  useFnAlertState: {
    isActOpen: false,
    content: "",
    fn: () => {},
  },

  toggleFnAlert: (props: FnAlertData) => {
    set(() => ({
      useFnAlertState: {
        isActOpen: props.isActOpen,
        content: props.content,
        fn: props.fn,
      },
    }));
  },
}));
