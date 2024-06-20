import { useState } from "react";
import { useRecoilState } from "recoil";
import { atom } from "recoil";

export interface TermsData {
  seq: number;
  title: string;
  content: string;
  required: boolean;
  inUsed: boolean;
  createDate: Date;
  checked?: boolean;
}

export const termsState = atom<TermsData[]>({
  key: "termsState",
  default: [
    {
      seq: 0,
      title: "",
      content: "",
      required: false,
      inUsed: false,
      createDate: new Date(),
      checked: false,
    },
  ],
});

export const useTerms = () => {
  const [useTermsState, setUseTermsState] =
    useRecoilState<TermsData[]>(termsState);
  const [selectedTerms, setSelectedTerms] = useState<number>(0);

  const fetchTermsList = async () => {
    try {
      const res = await fetch("api/auth/terms", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (res) {
        const data = await res.json();
        setUseTermsState(data.data);
      }
    } catch (err) {
    } finally {
    }
  };

  const selectTerms = async (seq: number) => {
    setSelectedTerms(seq);
  };

  const toggleCheck = (seq: number) => {
    setUseTermsState((prevTerms) =>
      prevTerms.map((term) =>
        term.seq === seq ? { ...term, checked: !term.checked } : term
      )
    );
  };

  const toggleCheckAll = (check: boolean) => {
    setUseTermsState((prevTerms) =>
      prevTerms.map((term) => ({ ...term, checked: check }))
    );
  };

  return {
    useTermsState,
    selectedTerms,
    fetchTermsList,
    selectTerms,
    toggleCheck,
    toggleCheckAll,
  };
};
