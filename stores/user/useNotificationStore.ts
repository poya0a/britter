import { create } from "zustand";
import fetchFile from "@fetch/fetchFile";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import storage from "@fetch/auth/storage";
import { useAlertStore } from "../popup/useAlertStore";
import { useRouteAlertStore } from "../popup/useRouteAlertStore";
import { useToastStore } from "../popup/useToastStore";
import { useSearchStore } from "../useSearchStore";

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
  postNotification: (formData: FormData) => Promise<void>;
  postLeaveNotification: (formData: FormData) => Promise<void>;
  setNotifications: (notifications: NotificationData[]) => void;
  setPageNo: (pageNo: number) => void;
  setLastPage: (lastPage: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  useNotificationState: [],
  pageNo: 0,
  lastPage: false,
  setNotifications: (notifications) =>
    set({ useNotificationState: notifications }),
  setPageNo: (pageNo) => set({ pageNo }),
  setLastPage: (lastPage) => set({ lastPage }),

  fetchNotification: async (page) => {
    const { setNotifications, setPageNo, setLastPage, useNotificationState } =
      get();
    const { toggleAlert } = useAlertStore.getState();
    const { toggleRouteAlert } = useRouteAlertStore.getState();

    try {
      const res = await fetchApi({
        method: "GET",
        url: `${requests.GET_NOTIFICATION_LIST}?page=${page + 1}`,
      });

      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode && res.data) {
        if (res.data && page !== get().pageNo) {
          setNotifications(
            page === 0 ? res.data : [...useNotificationState, ...res.data]
          );
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

  postNotification: async (formData: FormData) => {
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
      } else {
        setToast(res.message);

        if (res.data) {
          if (res.data.type === "space") {
            updateSpace(res.data.uid);
          } else if (res.data.type === "user") {
            updateUser(res.data.uid);
          }
        }
      }
    } catch (error: any) {
      toggleAlert(error.message);
    }
  },

  postLeaveNotification: async (formData: FormData) => {
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
      } else {
        setToast(res.message);

        if (res.data) {
          if (res.data.type === "space") {
            updateSpace(res.data.uid);
          } else if (res.data.type === "user") {
            updateUser(res.data.uid);
          }
        }
      }
    } catch (error: any) {
      toggleAlert(error.message);
    }
  },
}));

const updateSpace = async (uid: string) => {
  const { setUseSearchState, useSearchState } = useSearchStore.getState();
  try {
    const res = await fetchApi({
      method: "GET",
      url: `${requests.GET_SPACE}?searchUid=${uid}`,
    });

    if (res?.data) {
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
      setUseSearchState({ spaceList: updatedSpaceList });
    }
  } catch (error: any) {
    console.error(error.message);
  }
};

const updateUser = async (uid: string) => {
  const { setUseSearchState, useSearchState } = useSearchStore.getState();
  const spaceUid = storage.getSpaceUid();

  try {
    const res = await fetchApi({
      method: "GET",
      url: `${requests.GET_USER}?spaceUid=${spaceUid}&searchUid=${uid}`,
    });

    if (res?.data) {
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
      setUseSearchState({ userList: updatedUserList });
    }
  } catch (error: any) {
    console.error(error.message);
  }
};
