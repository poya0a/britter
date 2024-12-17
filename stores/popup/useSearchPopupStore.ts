import { create } from "zustand";

interface SearchData {
  isActOpen: boolean;
  mode: string;
}

interface SearchPopupStore {
  useSearchState: SearchData;
  toggleSearchPopup: (props: SearchData | boolean) => void;
}

export const useSearchPopupStore = create<SearchPopupStore>((set) => ({
  useSearchState: {
    isActOpen: false,
    mode: "",
  },

  toggleSearchPopup: (props: SearchData | boolean) => {
    if (!props) {
      set({ useSearchState: { isActOpen: false, mode: "" } });
    } else if (typeof props !== "boolean" && props) {
      set({ useSearchState: { isActOpen: props.isActOpen, mode: props.mode } });
    }
  },
}));
