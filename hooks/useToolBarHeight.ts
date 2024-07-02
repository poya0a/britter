import { useRecoilState } from "recoil";
import { atom } from "recoil";

export const toolBarHeightState = atom({
  key: "toolBarHeightState",
  default: 73,
});

export const useToolBarHeight = () => {
  const [useToolBarHeightState, setUseToolBarHeightState] =
    useRecoilState<number>(toolBarHeightState);

  const handleToolBarHeight = (props: number) => {
    setUseToolBarHeightState(props);
  };

  return {
    useToolBarHeightState,
    handleToolBarHeight,
  };
};
