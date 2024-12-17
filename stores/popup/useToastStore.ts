import { create } from "zustand";

interface ToastData {
  isActOpen: boolean;
  content: string;
}

interface ToastStore {
  useToastState: ToastData;
  setToast: (content: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  useToastState: { isActOpen: false, content: "" },
  setToast: (content: string) => {
    set({ useToastState: { isActOpen: true, content } });

    setTimeout(() => {
      set({ useToastState: { isActOpen: false, content: "" } });
    }, 3000);
  },
}));
