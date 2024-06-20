import { useRecoilState } from "recoil";
import { atom } from "recoil";

export const modalState = atom<boolean>({
  key: "modalState",
  default: false,
});

export const useModal = () => {
  const [useModalState, setUseModalState] = useRecoilState<boolean>(modalState);

  const toggleModal = (open: boolean) => {
    setUseModalState(open);
  };

  return {
    useModalState,
    toggleModal,
  };
};
