import { useRecoilState } from "recoil";
import { atom } from "recoil";

export const scrollLockState = atom<boolean>({
  key: "scrollLockState",
  default: false,
});

export const useScrollLock = () => {
  const [isLocked, setIsLocked] = useRecoilState<boolean>(scrollLockState);

  const toggleScrollLock = (lock: boolean) => {
    setIsLocked(lock);
  };

  return {
    isLocked,
    toggleScrollLock,
  };
};
