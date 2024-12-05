import { useEffect, useState } from "react";
import { FetchError } from "@fetch/types";
import { useRecoilState } from "recoil";
import { atom } from "recoil";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import { useAlert } from "../popup/useAlert";
import { useRouteAlert } from "../popup/useRouteAlert";
import { useToast } from "../popup/useToast";
import storage from "@fetch/auth/storage";
import { SpaceData } from "./useSpace";

export interface PostListData {
  seq: string;
  p_seq?: string;
  UID: string;
  title: string;
  content: string;
  subPost?: PostData[];
}

export interface PostData {
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

export interface PostResponse {
  message: string;
  data?: { seq: string };
  resultCode: boolean;
}

export const postListState = atom<PostListData[]>({
  key: "postListState",
  default: [
    {
      seq: "",
      UID: "",
      title: "",
      content: "",
    },
  ],
});

export const postState = atom<PostData>({
  key: "postState",
  default: {
    seq: "",
    UID: "",
    title: "",
    content: "",
    create_date: new Date(),
  },
});

export const usePost = () => {
  const queryClient = useQueryClient();
  const [usePostListState, setUsePostListState] =
    useRecoilState<PostListData[]>(postListState);
  const [usePostState, setUsePostState] = useRecoilState<PostData>(postState);
  const [editorContent, setEditorContent] = useState<string>("");
  const { toggleAlert } = useAlert();
  const { toggleRouteAlert } = useRouteAlert();
  const { setToast } = useToast();

  const postUid = queryClient.getQueryData<SpaceData>(["selectedSpace"])?.UID;
  const [auto, setAuto] = useState<boolean | null>(null);
  const { data: type = "view" } = useQuery<string>({
    queryKey: ["type"],
    queryFn: () => {
      const data = queryClient.getQueryData<string>(["type"]) ?? "view";
      return data;
    },
  });
  const { data: pageSeq } = useQuery<
    {
      seq: string;
      pSeq: string;
    },
    Error
  >({
    queryKey: ["pageSeq"],
    queryFn: () => {
      const data = queryClient.getQueryData<{
        seq: string;
        pSeq: string;
      }>(["pageSeq"]) ?? {
        seq: "",
        pSeq: "",
      };
      return data;
    },
    initialData: { seq: "", pSeq: "" },
  });
  const { data: pathname = [] } = useQuery<{ title: string; seq: string }[]>({
    queryKey: ["pathname"],
    queryFn: async () => {
      const data = queryClient.getQueryData<{ title: string; seq: string }[]>([
        "pathname",
      ]);
      return data ?? [];
    },
  });

  const fetchPostList = async (): Promise<PostListData[]> => {
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

      return res.data;
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
  };

  const { data: postList } = useQuery<PostListData[], Error>({
    queryKey: ["postList", postUid],
    queryFn: fetchPostList,
    staleTime: 5 * 60 * 1000,
    enabled: !!postUid,
  });

  const { data: post } = useQuery<PostData, Error>({
    queryKey: ["post"],
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: fetchPost } = useMutation({
    mutationFn: (pageSeq: string) =>
      fetchApi({
        method: "GET",
        url: `${requests.GET_POST}?postSeq=${pageSeq}`,
      }),
    onSuccess: (res: PostResponse) => {
      queryClient.invalidateQueries({ queryKey: ["post"] });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode && res.data) {
        queryClient.setQueryData(["post"], res.data);
      }
    },
    onError: (error: FetchError) => {
      toggleRouteAlert({
        isActOpen: true,
        content: error.message,
        route: "/login",
      });
      storage.removeToken();
    },
  });

  const { mutate: savePost } = useMutation({
    mutationFn: (formData: FormData) =>
      fetchApi({
        method: "POST",
        url: requests.SAVE_POST,
        body: formData,
      }),
    onSuccess: (res: PostResponse) => {
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode && res.data) {
        if (!auto) {
          toggleAlert(res.message);
          setType("view");
        } else {
          setToast(res.message);
        }
        queryClient.invalidateQueries({ queryKey: ["postList"] });
        setPageSeq({ seq: res.data.seq, pSeq: "" });
        fetchPost(res.data.seq);
      }
      setAuto(null);
    },
    onError: (error: FetchError) => {
      toggleAlert(error.message);
    },
  });

  const { mutate: deletePost } = useMutation({
    mutationFn: (seq: string) =>
      fetchApi({
        method: "POST",
        url: requests.DELETE_POST,
        body: JSON.stringify({ seq }),
      }),
    onSuccess: (res: PostResponse) => {
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode && res.data) {
        queryClient.invalidateQueries({ queryKey: ["postList"] });
        setPageSeq({ seq: "", pSeq: res.data.seq });
        setType("view");
        setToast(res.message);
      }
    },
    onError: (error: FetchError) => {
      toggleAlert(error.message);
    },
  });

  useEffect(() => {
    if (postList) {
      queryClient.setQueryData(["postList"], postList);
      setUsePostListState(postList);
    }
  }, [postList]);

  useEffect(() => {
    if (post) {
      setUsePostState(post);
    }
  }, [post]);

  const setType = (type: string) => {
    queryClient.setQueryData(["type"], type);
  };

  const setPageSeq = (seqObject: { seq: string; pSeq: string }) => {
    queryClient.setQueryData(["pageSeq"], seqObject);
    if (seqObject.seq !== "" && pageSeq.seq !== seqObject.seq) {
      fetchPost(seqObject.seq);
    }
  };

  const setPathname = (
    pathname: {
      title: string;
      seq: string;
    }[]
  ) => {
    queryClient.setQueryData(["pathname"], pathname);
  };

  return {
    usePostListState,
    usePostState,
    post,
    editorContent,
    type,
    pageSeq,
    pathname,
    auto,
    setEditorContent,
    setType,
    setPageSeq,
    setPathname,
    fetchPost,
    savePost,
    deletePost,
    setAuto,
  };
};
