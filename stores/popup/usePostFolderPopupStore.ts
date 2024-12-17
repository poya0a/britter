import { create } from "zustand";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import { useAlertStore } from "./useAlertStore";
import { useToastStore } from "./useToastStore";
import { usePostStore } from "../user/usePostStore";

interface PostFolderPopupData {
  isActOpen: boolean;
  spaceUid: string;
  type: string;
  seq: string;
  pSeq?: string;
}

interface PostFolderPopupStore {
  usePostFolderPopupState: PostFolderPopupData;
  togglePostFolderPopup: (props: PostFolderPopupData) => Promise<void>;
  moveAndCopyPost: (formData: FormData) => Promise<boolean>;
}

export const usePostFolderPopupStore = create<PostFolderPopupStore>(
  (set, get) => ({
    usePostFolderPopupState: {
      isActOpen: false,
      spaceUid: "",
      type: "",
      seq: "",
    },

    togglePostFolderPopup: async (props: PostFolderPopupData) => {
      const { fetchPostList } = usePostStore.getState();

      if (props.isActOpen) {
        set({ usePostFolderPopupState: props });
      } else {
        if (props.pSeq && props.spaceUid) {
          const formData = new FormData();

          formData.append("spaceUid", props.spaceUid);
          formData.append("type", props.type);
          formData.append("seq", props.seq);
          formData.append("pSeq", props.pSeq);

          const move = await get().moveAndCopyPost(formData);

          if (move) {
            set({ usePostFolderPopupState: props });
            fetchPostList();
          }
        } else {
          set({ usePostFolderPopupState: props });
        }
      }
    },

    moveAndCopyPost: async (formData: FormData): Promise<boolean> => {
      const { toggleAlert } = useAlertStore.getState();
      const { setToast } = useToastStore.getState();
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
            get().usePostFolderPopupState.type === "move" ? "이동" : "복사"
          }실패하였습니다.`
        );
      }
      return false;
    },
  })
);
