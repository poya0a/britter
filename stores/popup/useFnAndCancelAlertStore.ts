import { create } from "zustand";

interface FnAndCancelAlertData {
  isActOpen: boolean;
  content: string;
  fn: Function;
}

interface FnAndCancelAlertState {
  useFnAndCancelAlertState: FnAndCancelAlertData;
  toggleFnAndCancelAlert: (props: FnAndCancelAlertData) => void;
}

export const useFnAndCancelAlertStore = create<FnAndCancelAlertState>(
  (set) => ({
    useFnAndCancelAlertState: {
      isActOpen: false,
      content: "",
      fn: () => {},
    },

    toggleFnAndCancelAlert: (props: FnAndCancelAlertData) => {
      set(() => ({
        useFnAndCancelAlertState: {
          isActOpen: props.isActOpen,
          content: props.content,
          fn: props.fn,
        },
      }));
    },
  })
);
