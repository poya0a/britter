import { useRecoilState } from "recoil";
import { atom } from "recoil";

interface SearchData {
  isActOpen: boolean;
}

export const searchState = atom<SearchData>({
  key: "searchState",
  default: {
    isActOpen: false,
  },
});

export const useSearchPopup = () => {
  const [useSearchState, setUseSearchState] =
    useRecoilState<SearchData>(searchState);

  const toggleSearchPopup = (props: boolean) => {
    setUseSearchState({ isActOpen: props });
  };

  const toggleTap = (props: string | boolean) => {};

  return {
    useSearchState,
    toggleSearchPopup,
    toggleTap,
  };
};
