import { create } from "zustand";
import fetchFile from "@fetch/fetchFile";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import storage from "@fetch/auth/storage";
import { useAlertStore } from "../popup/useAlertStore";
import { useRouteAlertStore } from "../popup/useRouteAlertStore";
import { useToastStore } from "../popup/useToastStore";
import { useSearchStore } from "../useSearchStore";
import { useSpaceStore } from "./useSpaceStore";

export interface NotificationData {
  UID: string;
  recipient_uid: string;
  sender_uid: string;
  notify_type: string;
  create_date: Date;
  name?: string;
}

interface NotificationStore {
  useNotificationState: NotificationData[];
  pageNo: number;
  lastPage: boolean;
  fetchNotification: (page: number) => Promise<void>;
  postNotification: (formData: FormData) => Promise<boolean>;
  postLeaveNotification: (formData: FormData) => Promise<boolean>;
  setNotifications: (notifications: NotificationData[]) => void;
  setPageNo: (pageNo: number) => void;
  setLastPage: (lastPage: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  useNotificationState: [],
  pageNo: 0,
  lastPage: false,
  setNotifications: (notifications) => set({ useNotificationState: notifications }),
  setPageNo: (pageNo) => set({ pageNo }),
  setLastPage: (lastPage) => set({ lastPage }),

  fetchNotification: async (page) => {
    const spaceUid = storage.getSpaceUid();
    const { setNotifications, setPageNo, setLastPage, useNotificationState } = get();
    const { toggleAlert } = useAlertStore.getState();
    const { toggleRouteAlert } = useRouteAlertStore.getState();

    try {
      const res = await fetchApi({
        method: "GET",
        url: `${requests.GET_NOTIFICATION_LIST}?spaceUid=${spaceUid}&page=${page + 1}`,
      });

      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode && res.data) {
        if (res.pageInfo && page !== res.pageInfo.currentPage) {
          setNotifications(page === 0 ? res.data : [...useNotificationState, ...res.data]);
          setPageNo(res.pageInfo?.currentPage || 0);
          setLastPage(res.pageInfo?.currentPage === res.pageInfo?.totalPages);
        }
      }
    } catch (error: any) {
      toggleRouteAlert({
        isActOpen: true,
        content: error.message,
        route: "/login",
      });
      storage.removeToken();
    }
  },

  postNotification: async (formData: FormData): Promise<boolean> => {
    const { fetchNotification } = get();
    const { toggleAlert } = useAlertStore.getState();
    const { setToast } = useToastStore.getState();
    try {
      const res = await fetchApi({
        method: "POST",
        url: requests.POST_NOTIFICATION,
        body: formData,
      });

      if (!res.resultCode) {
        toggleAlert(res.message);
        return false;
      } else {
        setToast(res.message);

        if (res.data) {
          fetchNotification(0);
          if (res.data.type === "space") {
            updateSpace(res.data.uid);
          } else if (res.data.type === "user") {
            updateUser(res.data.uid);
          }
        }
        return true;
      }
    } catch (error: any) {
      toggleAlert(error.message);
      return false;
    }
  },

  postLeaveNotification: async (formData: FormData): Promise<boolean> => {
    const { toggleAlert } = useAlertStore.getState();
    const { setToast } = useToastStore.getState();
    try {
      const res = await fetchApi({
        method: "POST",
        url: requests.LEAVE_SPACE,
        body: formData,
      });

      if (!res.resultCode) {
        toggleAlert(res.message);
        return false;
      } else {
        setToast(res.message);

        if (res.data) {
          if (res.data.type === "space") {
            updateSpace(res.data.uid);
          } else if (res.data.type === "user") {
            updateUser(res.data.uid);
          }
        }
        return true;
      }
    } catch (error: any) {
      toggleAlert(error.message);
      return false;
    }
  },
}));

const updateSpace = async (uid: string) => {
  const { setUseSearchState, useSearchState } = useSearchStore.getState();
  const { toggleAlert } = useAlertStore.getState();
  try {
    const res = await fetchApi({
      method: "GET",
      url: `${requests.GET_SPACE}?searchUid=${uid}`,
    });

    if (res?.data) {
      const updatedSpaceList = await Promise.all(
        useSearchState.spaceList?.map(async (space) => {
          if (space.UID === res.data.UID) {
            if (res.data.space_profile_seq !== null) {
              const space_profile_path = await fetchFile(res.data.space_profile_seq);
              return { ...res.data, space_profile_path };
            }
            return res.data;
          } else {
            return space;
          }
        }) || []
      );
      setUseSearchState({ spaceList: updatedSpaceList });
    }
  } catch (error: any) {
    toggleAlert(error.message);
  }
};

const updateUser = async (uid: string) => {
  const { setUseSearchState, useSearchState } = useSearchStore.getState();
  const { setUseSpaceMemeberState } = useSpaceStore.getState();
  const spaceUid = storage.getSpaceUid();
  const { toggleAlert } = useAlertStore.getState();

  try {
    const res = await fetchApi({
      method: "GET",
      url: `${requests.GET_USER}?spaceUid=${spaceUid}&searchUid=${uid}`,
    });

    if (res?.data) {
      // 검색 팝업에서 화면 업데이트
      const updatedUserList = await Promise.all(
        useSearchState.userList?.map(async (user) => {
          if (user.UID === res.data.UID) {
            if (res.data.user_profile_seq !== null) {
              const user_profile_path = await fetchFile(res.data.user_profile_seq);
              return { ...res.data, user_profile_path };
            }
            return res.data;
          } else {
            return user;
          }
        }) || []
      );
      setUseSearchState({ userList: updatedUserList });

      // 스페이스 설정 팝업에서 멤버 정보 업데이트
      if (spaceUid) {
        setUseSpaceMemeberState(spaceUid, 0);
      }
    }
  } catch (error: any) {
    toggleAlert(error.message);
  }
};
