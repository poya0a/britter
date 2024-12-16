import { useEffect, useState } from "react";
import { FetchError } from "@fetch/types";
import fetchFile from "@fetch/fetchFile";
import { useRecoilState, atom } from "recoil";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import storage from "@fetch/auth/storage";
import { useAlert } from "../popup/useAlert";
import { useRouteAlert } from "../popup/useRouteAlert";
import { useToast } from "../popup/useToast";
import { searchData } from "../useSearch";
import { SpaceData } from "./useSpace";

export interface NotificationData {
  UID: string;
  recipient_uid: string;
  sender_uid: string;
  notify_type: string;
  create_date: Date;
  name?: string;
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

export type RequestData = {
  uid?: string;
  recipient: string;
  sender: string;
  type: string;
  response?: boolean;
};

export interface UpdateNotificationResponse {
  message: string;
  data?: {
    type: string;
    uid: string;
  };
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

  const [useSearchState, setUseSearchState] = useRecoilState(searchData);
  const { toggleAlert } = useAlert();
  const { toggleRouteAlert } = useRouteAlert();
  const { setToast } = useToast();
  const [pageNo, setPageNo] = useState<number>(0);
  const [lastPage, setLastPage] = useState<boolean>(false);

  const { data } = useQuery<NotificationResponse, Error>({
    queryKey: ["notification"],
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: fetchNotification } = useMutation({
    mutationFn: (page: number) => {
      return fetchApi({
        method: "GET",
        url: `${requests.GET_NOTIFICATION_LIST}?page=${page + 1}`,
      });
    },
    onSuccess: (res: NotificationResponse) => {
      queryClient.invalidateQueries({ queryKey: ["notification"] });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode && res.data) {
        queryClient.setQueryData(["notification"], res);
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
        setToast(res.message);

        if (res.data) {
          if (res.data.type === "space") {
            updateSpace(res.data.uid);
          } else if (res.data.type === "user") {
            updateUser(res.data.uid);
          }
        }
      }
    },
    onError: (error: FetchError) => {
      toggleAlert(error.message);
    },
  });

  const { mutate: postLeaveNotification } = useMutation({
    mutationFn: (formData: FormData) =>
      fetchApi({
        method: "POST",
        url: requests.LEAVE_SPACE,
        body: formData,
      }),
    onSuccess: (res: UpdateNotificationResponse) => {
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode) {
        setToast(res.message);

        if (res.data) {
          if (res.data.type === "space") {
            updateSpace(res.data.uid);
          } else if (res.data.type === "user") {
            updateUser(res.data.uid);
          }
        }
      }
    },
    onError: (error: FetchError) => {
      toggleAlert(error.message);
    },
  });

  const updateSpace = async (uid: string) => {
    const res = await fetchApi({
      method: "GET",
      url: `${requests.GET_SPACE}?searchUid=${uid}`,
    });

    if (res?.data) {
      const updateSpaceList = async () => {
        const updatedSpaceList = await Promise.all(
          useSearchState.spaceList?.map(async (space) => {
            if (space.UID === res.data.UID) {
              const space_profile_path = await fetchFile(
                res.data.space_profile_seq
              );
              return { ...res.data, space_profile_path };
            } else {
              return space;
            }
          }) || []
        );
        setUseSearchState((prevState) => ({
          ...prevState,
          spaceList: updatedSpaceList,
        }));
      };

      await updateSpaceList();
    }

    // 스페이스 접속 상태에서 이벤트 실행했을 때 화면 업데이트
    if (storage.getSpaceUid() === res.data.UID) {
      queryClient.setQueryData(["selectedSpace"], res.data);
    }
    queryClient.refetchQueries({ queryKey: ["space"] });
  };

  const updateUser = async (uid: string) => {
    const spaceUid = queryClient.getQueryData<SpaceData>([
      "selectedSpace",
    ])?.UID;

    const res = await fetchApi({
      method: "GET",
      url: `${requests.GET_USER}?spaceUid=${spaceUid}&searchUid=${uid}`,
    });

    if (res?.data) {
      const updateUserList = async () => {
        const updatedUserList = await Promise.all(
          useSearchState.userList?.map(async (user) => {
            if (user.UID === res.data.UID) {
              const user_profile_path = await fetchFile(
                res.data.user_profile_seq
              );
              return { ...res.data, user_profile_path };
            } else {
              return user;
            }
          }) || []
        );
        setUseSearchState((prevState) => ({
          ...prevState,
          userList: updatedUserList,
        }));
      };

      await updateUserList();
    }
    queryClient.refetchQueries({ queryKey: ["spaceMember"] });
  };

  return {
    useNotificationState,
    pageNo,
    lastPage,
    fetchNotification,
    postNotification,
    postLeaveNotification,
  };
};
