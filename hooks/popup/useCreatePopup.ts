import { useRecoilState } from "recoil";
import { atom } from "recoil";

interface CreateData {
  isActOpen: boolean;
  mode: string;
}

export const createState = atom<CreateData>({
  key: "createState",
  default: {
    isActOpen: false,
    mode: "",
  },
});

export const useCreatePopup = () => {
  const [useCreateState, setUseCreateState] =
    useRecoilState<CreateData>(createState);

  const toggleCreatePopup = (props: CreateData | boolean) => {
    if (!props) {
      setUseCreateState({ isActOpen: false, mode: "" });
    } else if (typeof props !== "boolean" && props) {
      setUseCreateState({ isActOpen: props.isActOpen, mode: props.mode });
    }
  };

  return {
    useCreateState,
    toggleCreatePopup,
  };
};
