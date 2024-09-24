import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { atom } from "recoil";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import { useAlert } from "./popup/useAlert";
import { useRouteAlert } from "./popup/useRouteAlert";
import { useToast } from "./popup/useToast";
import storage from "@fetch/auth/storage";
import { SpaceData } from "./user/useSpace";
import { useUpdateEffect } from "@/utils/useUpdateEffect";

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

export const postState = atom<PostData[]>({
  key: "postState",
  default: [
    {
      seq: "",
      UID: "",
      title: "",
      content: "",
      create_date: new Date(),
    },
  ],
});

export const usePost = () => {
  const queryClient = useQueryClient();
  const [usePostState, setUsePostState] = useRecoilState<PostData[]>(postState);
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

  const { data } = useQuery<PostData[], Error>({
    queryKey: ["post"],
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: fetchPost } = useMutation({
    mutationFn: () =>
      fetchApi({
        method: "POST",
        url: requests.GET_POST,
        body: JSON.stringify({ postUid }),
      }),
    onSuccess: (res: PostResponse) => {
      queryClient.invalidateQueries({ queryKey: ["post"] });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode && res.data) {
        queryClient.setQueryData(["post"], res.data);
      }
    },
    onError: (error: any) => {
      if (error.code === 403 || error.code === 401) {
        toggleRouteAlert({
          isActOpen: true,
          content: error.message,
          route: "/login",
        });
        storage.removeToken();
      }
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
        fetchPost();
        setPageSeq({ seq: res.data.seq, pSeq: "" });
        setAuto(null);
      }
    },
    onError: (error: any) => {
      toggleAlert(error);
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
        fetchPost();
        setPageSeq({ seq: "", pSeq: res.data.seq });
        setType("view");
        setToast(res.message);
      }
    },
    onError: (error: any) => {
      toggleAlert(error);
    },
  });

  useEffect(() => {
    if (data) {
      setUsePostState(data);
    }
  }, [data, setUsePostState]);

  const setType = (type: string) => {
    queryClient.setQueryData(["type"], type);
  };

  const setPageSeq = (pageSeq: { seq: string; pSeq: string }) => {
    queryClient.setQueryData(["pageSeq"], pageSeq);
  };

  const setPathname = (
    pathname: {
      title: string;
      seq: string;
    }[]
  ) => {
    queryClient.setQueryData(["pathname"], pathname);
  };

  const findPostBySeq = (
    posts: PostData[],
    seq: string
  ): PostData | undefined => {
    for (const post of posts) {
      if (post.seq === seq) {
        return post;
      }
      if (post.subPost) {
        const found = findPostBySeq(post.subPost, seq);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  };

  useUpdateEffect(() => {
    if (postUid !== "") {
      fetchPost();
    }
  }, [postUid]);

  return {
    usePostState,
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
    findPostBySeq,
  };
};
