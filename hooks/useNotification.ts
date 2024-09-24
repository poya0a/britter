import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { atom } from "recoil";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import storage from "@fetch/auth/storage";
import { useAlert } from "./popup/useAlert";
import { useRouteAlert } from "./popup/useRouteAlert";
import { useToast } from "./popup/useToast";

export interface NotificationData {
  UID: string;
  recipient_uid: string;
  sender_uid: string;
  notify_type: string;
  confirm: boolean;
}

export interface NotificationResponse {
  message: string;
  data?: NotificationData[];
  pageInfo?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  resultCode: boolean;
}

export interface UpdateNotificationResponse {
  message: string;
  resultCode: boolean;
}

export const notificationDataState = atom<NotificationData[]>({
  key: "notificationDataState",
  default: [],
});

export const useNotification = () => {
  const queryClient = useQueryClient();
  const [useNotificationState, setUseNotificationState] = useRecoilState<
    NotificationData[]
  >(notificationDataState);
  const { toggleAlert } = useAlert();
  const { toggleRouteAlert } = useRouteAlert();
  const { setToast } = useToast();
  const [pageNo, setPageNo] = useState<number>(0);
  const [lastPage, setLastPage] = useState<boolean>(false);

  const { data } = useQuery<NotificationResponse, Error>({
    queryKey: ["notification"],
    queryFn: () =>
      fetchApi({
        method: "GET",
        url: `${requests.GET_NOTIFICATION_LIST}?page=${pageNo + 1}`,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: fetchNotification } = useMutation({
    mutationFn: () =>
      fetchApi({
        method: "GET",
        url: `${requests.GET_NOTIFICATION_LIST}?page=${pageNo + 1}`,
      }),
    onSuccess: (res: NotificationResponse) => {
      queryClient.invalidateQueries({ queryKey: ["notification"] });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode && res.data) {
        queryClient.setQueryData(["notification"], res);
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

  useEffect(() => {
    if (data && pageNo !== data.pageInfo?.currentPage) {
      if (pageNo === 0 && useNotificationState.length > 0 && data.data) {
        setUseNotificationState(data.data);
      } else {
        setUseNotificationState((prevState) => [
          ...(prevState ?? []),
          ...(data.data || []),
        ]);
      }
      setPageNo(data.pageInfo?.currentPage || 0);
      setLastPage(data.pageInfo?.currentPage === data.pageInfo?.totalPages);
    }
  }, [data]);

  const { mutate: postNotification } = useMutation({
    mutationFn: (formData: FormData) =>
      fetchApi({
        method: "POST",
        url: requests.POST_NOTIFICATION,
        body: formData,
      }),
    onSuccess: (res: UpdateNotificationResponse) => {
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode) {
        fetchNotification();
        setToast(res.message);
      }
    },
    onError: (error: any) => {
      toggleAlert(error);
    },
  });

  return {
    useNotificationState,
    pageNo,
    lastPage,
    fetchNotification,
    postNotification,
  };
};
