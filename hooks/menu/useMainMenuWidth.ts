import { useRecoilState } from "recoil";
import { atom } from "recoil";

export const mainMenuWidthState = atom({
  key: "mainMenuWidthState",
  default: 240,
});

export const useMainMenuWidth = () => {
  const [useMainMenuWidthState, setUseMainMenuWidthState] =
    useRecoilState<number>(mainMenuWidthState);

  const handleMainMenuWidth = (props: number) => {
    setUseMainMenuWidthState(props);
  };

  return {
    useMainMenuWidthState,
    handleMainMenuWidth,
  };
};
