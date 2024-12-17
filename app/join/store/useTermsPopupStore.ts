import { create } from "zustand";

interface TermsPopupState {
  useTermsPopupState: boolean;
  toggleTermsPopup: (open: boolean) => void;
}

export const useTermsPopupStore = create<TermsPopupState>((set) => ({
  useTermsPopupState: false,
  toggleTermsPopup: (open: boolean) =>
    set(() => ({
      useTermsPopupState: open,
    })),
}));
