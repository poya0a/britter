import { create } from "zustand";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import storage from "@fetch/auth/storage";
import { FetchError } from "@fetch/types";
import { useAlertStore } from "../popup/useAlertStore";
import { useRouteAlertStore } from "../popup/useRouteAlertStore";
import { useToastStore } from "../popup/useToastStore";

export interface PostListData {
  seq: string;
  p_seq?: string;
  UID: string;
  title: string;
  content: string;
  subPost?: PostData[];
}

interface PostData {
  seq: string;
  p_seq?: string;
  UID: string;
  tag_seq?: number;
  title: string;
  content: string;
  create_date: Date;
  modify_date?: Date;
  subPost?: PostData[];
}

interface PostStore {
  usePostListState: PostListData[];
  usePostState: PostData;
  editorContent: string;
  type: string;
  pageSeq: { seq: string; pSeq: string };
  pathname: { title: string; seq: string }[];
  auto: boolean | null;
  setUsePostListState: (posts: PostListData[]) => void;
  setUsePostState: (post: PostData) => void;
  setEditorContent: (content: string) => void;
  setType: (type: string) => void;
  setPageSeq: (pageSeq: { seq: string; pSeq: string }) => void;
  setPathname: (pathname: { title: string; seq: string }[]) => void;
  setAuto: (auto: boolean | null) => void;
  fetchPostList: (spaceUid?: string) => Promise<void>;
  fetchPost: (pageSeq: string) => Promise<void>;
  savePost: (formData: FormData) => Promise<void>;
  deletePost: (seq: string) => Promise<void>;
}

export const usePostStore = create<PostStore>((set, get) => ({
  usePostListState: [],
  usePostState: {
    seq: "",
    UID: "",
    title: "",
    content: "",
    create_date: new Date(),
  },
  editorContent: "",
  type: "view",
  pageSeq: { seq: "", pSeq: "" },
  pathname: [],
  auto: null,

  setUsePostListState: (posts) => set({ usePostListState: posts }),
  setUsePostState: (post) => set({ usePostState: post }),
  setEditorContent: (content) => set({ editorContent: content }),
  setType: (type) => set({ type }),
  setPageSeq: (seqObject) => {
    const { pageSeq } = get();
    if (seqObject.seq !== "" && pageSeq.seq !== seqObject.seq) {
      get().fetchPost(seqObject.seq);
    }
    set({ pageSeq: seqObject });
  },
  setPathname: (pathname) => set({ pathname }),
  setAuto: (auto) => set({ auto }),

  fetchPostList: async (spaceUid?: string) => {
    const { toggleAlert } = useAlertStore.getState();
    const { toggleRouteAlert } = useRouteAlertStore.getState();
    const { setUsePostListState } = get();
    const postUid = spaceUid ? spaceUid : storage.getSpaceUid();
    try {
      const res = await fetchApi({
        method: "POST",
        url: requests.GET_POST_LiST,
        body: JSON.stringify({ postUid }),
      });
      if (!res) {
        throw new Error("데이터를 가져오는 데 실패했습니다.");
      }

      if (!res.resultCode) {
        toggleAlert(res.message);
      }
      setUsePostListState(res.data);
    } catch (error) {
      if (error instanceof FetchError) {
        toggleRouteAlert({
          isActOpen: true,
          content: error.message,
          route: "/login",
        });
        storage.removeToken();
      }
      throw error;
    }
  },

  fetchPost: async (pageSeq: string) => {
    const { toggleAlert } = useAlertStore.getState();
    const { toggleRouteAlert } = useRouteAlertStore.getState();
    const { setUsePostState } = get();
    try {
      const res = await fetchApi({
        method: "GET",
        url: `${requests.GET_POST}?postSeq=${pageSeq}`,
      });
      if (!res) {
        throw new Error("데이터를 가져오는 데 실패했습니다.");
      }

      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode && res.data) {
        setUsePostState(res.data);
      }
    } catch (error) {
      if (error instanceof FetchError) {
        toggleRouteAlert({
          isActOpen: true,
          content: error.message,
          route: "/login",
        });
        storage.removeToken();
      }
      throw error;
    }
  },

  savePost: async (formData: FormData) => {
    const { toggleAlert } = useAlertStore.getState();
    const { setToast } = useToastStore.getState();
    const { fetchPostList, fetchPost, setPageSeq, setAuto, setType } = get();
    try {
      const res = await fetchApi({
        method: "POST",
        url: requests.SAVE_POST,
        body: formData,
      });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode && res.data) {
        if (!get().auto) {
          toggleAlert(res.message);
          setType("view");
        } else {
          setToast(res.message);
        }
        fetchPostList();
        setPageSeq({ seq: res.data.seq, pSeq: "" });
        fetchPost(res.data.seq);
      }
      setAuto(null);
    } catch (error: any) {
      toggleAlert(error.message);
    }
  },

  deletePost: async (seq: string) => {
    const { toggleAlert } = useAlertStore.getState();
    const { setToast } = useToastStore.getState();
    const { fetchPostList } = get();
    try {
      const res = await fetchApi({
        method: "POST",
        url: requests.DELETE_POST,
        body: JSON.stringify({ seq }),
      });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode && res.data) {
        fetchPostList();
        setToast(res.message);
      }
    } catch (error: any) {
      toggleAlert(error.message);
    }
  },
}));
