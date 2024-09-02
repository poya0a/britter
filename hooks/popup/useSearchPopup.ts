import { useRecoilState } from "recoil";
import { atom } from "recoil";

interface SearchData {
  isActOpen: boolean;
  mode: string;
}

export const searchState = atom<SearchData>({
  key: "searchState",
  default: {
    isActOpen: false,
    mode: "",
  },
});

export const useSearchPopup = () => {
  const [useSearchState, setUseSearchState] =
    useRecoilState<SearchData>(searchState);

  const toggleSearchPopup = (props: SearchData | boolean) => {
    if (!props) {
      setUseSearchState({ isActOpen: false, mode: "" });
    } else if (typeof props !== "boolean" && props) {
      setUseSearchState({ isActOpen: props.isActOpen, mode: props.mode });
    }
  };

  return {
    useSearchState,
    toggleSearchPopup,
  };
};
