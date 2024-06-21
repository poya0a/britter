import { useRecoilState } from "recoil";
import { atom } from "recoil";

export const loadingState = atom<boolean>({
  key: "loadingState",
  default: false,
});

export const useLoading = () => {
  const [useLoadingState, setUseLoadingState] =
    useRecoilState<boolean>(loadingState);

  const toggleLoading = (props: boolean) => {
    setUseLoadingState(props);
  };

  return {
    useLoadingState,
    toggleLoading,
  };
};
