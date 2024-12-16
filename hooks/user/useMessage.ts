import { useEffect, useState } from "react";
import { FetchError } from "@fetch/types";
import { useRecoilState, atom } from "recoil";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import storage from "@fetch/auth/storage";
import { useAlert } from "../popup/useAlert";
import { useRouteAlert } from "../popup/useRouteAlert";
import { useToast } from "../popup/useToast";

export interface MessageData {
  UID: string;
  recipient_uid: string;
  sender_uid: string;
  message: string;
  create_date: Date;
  confirm: boolean;
  name?: string;
}

export interface MessageListResponse {
  message: string;
  data?: MessageData[];
  pageInfo?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  unreadMessageCount?: number;
  resultCode: boolean;
}

export interface MessageResponse {
  message: string;
  data?: { message: MessageData };
  resultCode: boolean;
}

export const messageListState = atom<MessageData[]>({
  key: "messageListState",
  default: [],
});

export const messageState = atom<MessageData>({
  key: "messageState",
  default: {
    UID: "",
    recipient_uid: "",
    sender_uid: "",
    message: "",
    create_date: new Date(),
    confirm: false,
  },
});

export const useMessage = () => {
  const queryClient = useQueryClient();
  const [useMessageListState, setUseMessageListState] =
    useRecoilState<MessageData[]>(messageListState);

  const { toggleAlert } = useAlert();
  const { toggleRouteAlert } = useRouteAlert();
  const { setToast } = useToast();
  const [unreadMessageCount, setUnreadMessageCount] = useState<number | null>(
    null
  );
  const [type, setType] = useState<string>("");
  const [pageNo, setPageNo] = useState<number>(0);
  const [lastPage, setLastPage] = useState<boolean>(false);
  const [searchWord, setSearchWord] = useState<string>("");

  const { data: messageList } = useQuery<MessageListResponse, Error>({
    queryKey: ["messageList"],
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: fetchMessageList } = useMutation({
    mutationFn: ({
      typeName,
      page,
      searchWord = "",
    }: {
      typeName: string;
      page: number;
      searchWord?: string;
    }) => {
      setType(typeName);
      setPageNo(page);
      setSearchWord(searchWord);
      return fetchApi({
        method: "GET",
        url: `${requests.GET_MESSAGE_LIST}?type=${typeName}&page=${page + 1}${
          searchWord ? `&searchWord=${searchWord}` : ""
        }`,
      });
    },
    onSuccess: (res: MessageListResponse) => {
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode && res.data) {
        queryClient.setQueryData(["messageList"], res);
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

  useEffect(() => {
    if (messageList && pageNo !== messageList.pageInfo?.currentPage) {
      if (messageList.data) {
        if (pageNo === 0) {
          setUseMessageListState(messageList.data);
        } else {
          setUseMessageListState((prevState) => [
            ...(prevState ?? []),
            ...(messageList.data || []),
          ]);
        }

        setPageNo(messageList.pageInfo?.currentPage || 0);
        setLastPage(
          messageList.pageInfo?.currentPage === messageList.pageInfo?.totalPages
        );
      }
    }
    setUnreadMessageCount(
      messageList && messageList.unreadMessageCount
        ? messageList.unreadMessageCount
        : null
    );
  }, [messageList]);

  const { data: message } = useQuery<MessageData, Error>({
    queryKey: ["message"],
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: fetchMessage } = useMutation({
    mutationFn: (messageUid: string) =>
      fetchApi({
        method: "GET",
        url: `${requests.GET_MESSAGE}?messageUid=${messageUid}`,
      }),
    onSuccess: (res: MessageResponse) => {
      queryClient.invalidateQueries({ queryKey: ["message"] });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode && res.data) {
        queryClient.setQueryData(["message"], res.data);
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

  const handleReadMessage = async (uid: string) => {
    const res = await fetchApi({
      method: "POST",
      url: requests.READ_MESSAGE,
      body: JSON.stringify({ messageUid: uid }),
    });

    if (res?.data) {
      // 메시지를 읽음 상태로 화면 업데이트
      // 안 읽은 메시지 수 업데이트
      setUseMessageListState((prevList) =>
        prevList.map((message) =>
          message.UID === uid ? { ...message, confirm: true } : message
        )
      );

      queryClient.invalidateQueries({ queryKey: ["messageList"] });
    } else {
      toggleAlert(res.message);
    }
  };

  const handleDeleteMessage = async (uid: string) => {
    const res = await fetchApi({
      method: "POST",
      url: requests.DELETE_MESSAGE,
      body: JSON.stringify({ messageUid: uid }),
    });

    if (res?.data) {
      // 메시지 삭제 화면 업데이트
      setUseMessageListState((prevList) =>
        prevList.filter((message) => message.UID !== uid)
      );

      queryClient.invalidateQueries({ queryKey: ["messageList"] });
      setToast(res?.data.message);
    } else {
      toggleAlert(res.message);
    }
  };

  return {
    useMessageListState,
    message,
    unreadMessageCount,
    type,
    pageNo,
    lastPage,
    searchWord,
    fetchMessageList,
    fetchMessage,
    handleReadMessage,
    handleDeleteMessage,
  };
};
