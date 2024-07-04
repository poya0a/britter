import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { atom } from "recoil";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import { useAlert } from "./useAlert";
import { useRouter } from "next/navigation";
import { useToast } from "./useToast";
import storage from "@fetch/auth/storage";

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
  const [usePostState, setUsePostState] = useRecoilState<PostData[]>(postState);
  const [pageSeq, setPageSeq] = useState<string>("");
  const queryClient = useQueryClient();
  const { toggleAlert } = useAlert();
  const { setToast } = useToast();
  const router = useRouter();

  const fetchPost = async (): Promise<PostData[]> => {
    const res = await fetchApi({
      method: "GET",
      url: requests.GET_POST,
    });

    if (!res.resultCode) {
      throw new Error("게시글을 받는 중 에러가 발생하였습니다.");
    }

    return res.data;
  };

  const { data } = useQuery<PostData[], Error>({
    queryKey: ["post"],
    queryFn: fetchPost,
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: savePost } = useMutation({
    mutationFn: (formData: FormData) =>
      fetchApi({
        method: "POST",
        url: requests.SAVE_POST,
        body: formData,
      }),
    onSuccess: (res: PostResponse) => {
      queryClient.invalidateQueries({ queryKey: ["post"] });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode && res.data) {
        const userId = storage.getUserId();
        router.push(`/${userId}/${res.data.seq}`);
        setToast(res.message);
        setPageSeq(res.data.seq);
      }
    },
    onError: (error: any) => {
      toggleAlert(error);
    },
  });

  const { mutate: deletePost } = useMutation({
    mutationFn: (formData: FormData) =>
      fetchApi({
        method: "POST",
        url: requests.DELETE_POST,
        body: formData,
      }),
    onSuccess: (res: PostResponse) => {
      queryClient.invalidateQueries({ queryKey: ["post"] });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else {
        router.push("/");
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

  return {
    usePostState,
    pageSeq,
    setPageSeq,
    savePost,
    deletePost,
  };
};
