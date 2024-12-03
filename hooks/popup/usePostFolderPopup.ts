import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import { useRecoilState } from "recoil";
import { useQueryClient } from "@tanstack/react-query";
import { atom } from "recoil";
import { useAlert } from "./useAlert";
import { useToast } from "./useToast";

interface PostFolderPopupData {
  isActOpen: boolean;
  spaceUid: string;
  type: string;
  seq: string;
  pSeq?: string;
}

export const postFolderPopupState = atom<PostFolderPopupData>({
  key: "postFolderPopupState",
  default: {
    isActOpen: false,
    spaceUid: "",
    type: "",
    seq: "",
  },
});

export const usePostFolderPopup = () => {
  const queryClient = useQueryClient();
  const [usePostFolderPopupState, setUsePostFolderPopupState] =
    useRecoilState<PostFolderPopupData>(postFolderPopupState);
  const { toggleAlert } = useAlert();
  const { setToast } = useToast();

  const togglePostFolderPopup = async (props: PostFolderPopupData) => {
    if (props.isActOpen) {
      setUsePostFolderPopupState(props);
    } else {
      if (props.pSeq && props.spaceUid) {
        const formData = new FormData();

        formData.append("spaceUid", props.spaceUid);
        formData.append("type", props.type);
        formData.append("seq", props.seq);
        formData.append("pSeq", props.pSeq);

        const move = await moveAndCopyPost(formData);

        if (move) {
          setUsePostFolderPopupState(props);
          queryClient.invalidateQueries({ queryKey: ["postList"] });
        }
      } else {
        setUsePostFolderPopupState(props);
      }
    }
  };

  const moveAndCopyPost = async (formData: FormData): Promise<boolean> => {
    const res = await fetchApi({
      method: "POST",
      url: requests.MOVE_AND_COPY_POST,
      body: formData,
    });

    if (res.message) {
      if (res.resultCode) {
        setToast(res.message);
        return true;
      } else {
        toggleAlert(res.message);
      }
    } else {
      toggleAlert(
        `게시물 ${
          usePostFolderPopupState.type === "move" ? "이동" : "복사"
        }실패하였습니다.`
      );
    }
    return false;
  };

  return {
    usePostFolderPopupState,
    togglePostFolderPopup,
  };
};
