import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { atom } from "recoil";
import { useQuery } from "@tanstack/react-query";

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

  const fetchTermsList = async (): Promise<TermsData[]> => {
    const res = await fetch("/api/auth/terms", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error("이용약관을 받는 중 에러가 발생하였습니다.");
    }

    const data = await res.json();
    return data.data;
  };

  const { data } = useQuery<TermsData[], Error>({
    queryKey: ["terms"],
    queryFn: fetchTermsList,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) {
      setUseTermsState(data);
    }
  }, []);

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
    selectTerms,
    toggleCheck,
    toggleCheckAll,
  };
};
