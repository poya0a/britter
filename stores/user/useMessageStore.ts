import { create } from "zustand";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import storage from "@fetch/auth/storage";
import { useAlertStore } from "../popup/useAlertStore";
import { useRouteAlertStore } from "../popup/useRouteAlertStore";
import { useToastStore } from "../popup/useToastStore";

export interface MessageData {
  UID: string;
  recipient_uid: string;
  sender_uid: string;
  message: string;
  create_date: Date;
  confirm: boolean;
  name?: string;
}

interface MessageStore {
  useMessageListState: MessageData[];
  useMessageState: MessageData;
  unreadMessageCount: number | null;
  type: string;
  pageNo: number;
  lastPage: boolean;
  searchWord: string;

  fetchMessageList: (params: { typeName: string; page: number; searchWord?: string }) => Promise<void>;
  fetchMessage: (messageUid: string) => Promise<void>;
  handleReadMessage: (uid: string) => Promise<void>;
  handleDeleteMessage: (uid: string) => Promise<void>;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  useMessageListState: [],
  useMessageState: {
    UID: "",
    recipient_uid: "",
    sender_uid: "",
    message: "",
    create_date: new Date(),
    confirm: false,
  },
  unreadMessageCount: null,
  type: "",
  pageNo: 0,
  lastPage: false,
  searchWord: "",

  fetchMessageList: async ({ typeName, page, searchWord = "" }) => {
    const { toggleAlert } = useAlertStore.getState();
    const { toggleRouteAlert } = useRouteAlertStore.getState();
    set({ type: typeName, pageNo: page, searchWord });

    try {
      const res = await fetchApi({
        method: "GET",
        url: `${requests.GET_MESSAGE_LIST}?type=${typeName}&page=${page + 1}${
          searchWord ? `&searchWord=${searchWord}` : ""
        }`,
      });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode && res.data) {
        if (res.pageInfo && page !== res.pageInfo?.currentPage) {
          set({
            useMessageListState: get().pageNo === 0 ? res.data : [...get().useMessageListState, ...res.data],
            pageNo: res.pageInfo?.currentPage || 0,
            lastPage: res.pageInfo?.currentPage === res.pageInfo?.totalPages,
          });
        }
        set({ unreadMessageCount: res.unreadMessageCount || null });
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

  fetchMessage: async (messageUid: string) => {
    const { toggleAlert } = useAlertStore.getState();
    const { toggleRouteAlert } = useRouteAlertStore.getState();
    try {
      const res = await fetchApi({
        method: "GET",
        url: `${requests.GET_MESSAGE}?messageUid=${messageUid}`,
      });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode && res.data) {
        set({ useMessageState: res.data });
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

  handleReadMessage: async (uid: string) => {
    const { toggleAlert } = useAlertStore.getState();
    try {
      const res = await fetchApi({
        method: "POST",
        url: requests.READ_MESSAGE,
        body: JSON.stringify({ messageUid: uid }),
      });

      if (res?.data) {
        set((state) => ({
          useMessageListState: state.useMessageListState.map((message) =>
            message.UID === uid ? { ...message, confirm: true } : message
          ),
        }));
      } else {
        toggleAlert(res.message);
      }
    } catch (error: any) {
      toggleAlert(error.message);
    }
  },

  handleDeleteMessage: async (uid: string) => {
    const { toggleAlert } = useAlertStore.getState();
    const { setToast } = useToastStore.getState();
    try {
      const res = await fetchApi({
        method: "POST",
        url: requests.DELETE_MESSAGE,
        body: JSON.stringify({ messageUid: uid }),
      });

      if (res?.data) {
        set((state) => ({
          useMessageListState: state.useMessageListState.filter((message) => message.UID !== uid),
        }));
        setToast(res?.data.message);
      } else {
        toggleAlert(res.message);
      }
    } catch (error: any) {
      toggleAlert(error.message);
    }
  },
}));
