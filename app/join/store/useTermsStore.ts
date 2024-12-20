import { create } from "zustand";
import { useAlertStore } from "@stores/popup/useAlertStore";

export interface TermsData {
  seq: number;
  title: string;
  content: string;
  required: boolean;
  inUsed: boolean;
  createDate: Date;
  checked?: boolean;
}

interface TermsState {
  useTermsState: TermsData[];
  selectedTerms: number;
  fetchTermsList: () => Promise<void>;
  selectTerms: (seq: number) => void;
  toggleCheck: (seq: number) => void;
  toggleCheckAll: (check: boolean) => void;
}

export const useTermsStore = create<TermsState>((set) => ({
  useTermsState: [],
  selectedTerms: 0,

  fetchTermsList: async () => {
    const { toggleAlert } = useAlertStore.getState();
    try {
      const res = await fetch("/api/auth/terms", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("이용약관을 받는 중 에러가 발생하였습니다.");
      }

      const data = await res.json();
      set({ useTermsState: data.data });
    } catch (error: any) {
      toggleAlert(error);
    }
  },

  selectTerms: (seq: number) => {
    set({ selectedTerms: seq });
  },

  toggleCheck: (seq: number) => {
    set((state) => ({
      useTermsState: state.useTermsState.map((term) =>
        term.seq === seq ? { ...term, checked: !term.checked } : term
      ),
    }));
  },

  toggleCheckAll: (check: boolean) => {
    set((state) => ({
      useTermsState: state.useTermsState.map((term) => ({
        ...term,
        checked: check,
      })),
    }));
  },
}));
