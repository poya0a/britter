import { create } from "zustand";

interface AlertData {
  isActOpen: boolean;
  content: string;
}

interface AlertState {
  useAlertState: AlertData;
  toggleAlert: (props: string | boolean) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  useAlertState: {
    isActOpen: false,
    content: "",
  },

  toggleAlert: (props: string | boolean) => {
    if (typeof props === "string") {
      set(() => ({
        useAlertState: { isActOpen: true, content: props },
      }));
    } else {
      set(() => ({
        useAlertState: { isActOpen: false, content: "" },
      }));
    }
  },
}));
