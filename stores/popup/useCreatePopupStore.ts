import { create } from "zustand";

interface CreateData {
  isActOpen: boolean;
  mode: string;
}

interface CreatePopupState {
  useCreatePopupState: CreateData;
  toggleCreatePopup: (props: CreateData | boolean) => void;
}

export const useCreatePopupStore = create<CreatePopupState>((set) => ({
  useCreatePopupState: {
    isActOpen: false,
    mode: "",
  },

  toggleCreatePopup: (props) => {
    if (!props) {
      set(() => ({
        useCreatePopupState: { isActOpen: false, mode: "" },
      }));
    } else if (typeof props !== "boolean" && props) {
      set(() => ({
        useCreatePopupState: { isActOpen: props.isActOpen, mode: props.mode },
      }));
    }
  },
}));
