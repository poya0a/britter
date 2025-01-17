import { create } from "zustand";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import { FetchError } from "@fetch/types";
import { useAlertStore } from "../popup/useAlertStore";
import { useToastStore } from "../popup/useToastStore";
import { useRouteAlertStore } from "../popup/useRouteAlertStore";
import storage from "@fetch/auth/storage";
import fetchFile from "@fetch/fetchFile";

export interface InfoData {
  UID: string;
  user_profile_seq: number;
  user_profile_path?: string;
  user_id: string;
  user_name: string;
  user_hp: string;
  user_email?: string;
  user_birth?: string;
  user_public: boolean;
  user_level: number;
  create_date: Date;
  status_emoji?: string;
  status_message?: string;
}

interface InfoStore {
  useInfoState: InfoData;
  fetchInfo: () => Promise<void>;
  fetchDataAndUpdateState: (seq: number) => Promise<void>;
  updateInfo: (formData: FormData) => Promise<void>;
  toggleAlert: (message: string) => void;
  toggleRouteAlert: (props: { isActOpen: boolean; content: string; route: string }) => void;
  setToast: (message: string) => void;
}

export const useInfoStore = create<InfoStore>((set, get) => ({
  useInfoState: {
    UID: "",
    user_profile_seq: 0,
    user_id: "",
    user_name: "",
    user_hp: "",
    user_public: true,
    user_level: 1,
    create_date: new Date(),
  },
  toggleAlert: (message) => {
    const { toggleAlert } = useAlertStore.getState();
    toggleAlert(message);
  },
  toggleRouteAlert: (props) => {
    const { toggleRouteAlert } = useRouteAlertStore.getState();
    toggleRouteAlert(props);
  },
  setToast: (message) => {
    const { setToast } = useToastStore.getState();
    setToast(message);
  },

  fetchInfo: async () => {
    try {
      const res = await fetchApi({
        method: "GET",
        url: requests.USER_INFO,
      });
      if (!res) {
        throw new Error("데이터를 가져오는 데 실패했습니다.");
      }

      if (res.data && get().useInfoState.UID !== res.data.UID) {
        set({ useInfoState: res.data });
        if (!res.data.user_profile_path) {
          get().fetchDataAndUpdateState(res.data.user_profile_seq);
        }
      }
    } catch (error) {
      if (error instanceof FetchError) {
        get().toggleRouteAlert({
          isActOpen: true,
          content: error.message,
          route: "/login",
        });
        storage.removeToken();
      }
      throw error;
    }
  },

  fetchDataAndUpdateState: async (seq: number) => {
    try {
      const filePath = await fetchFile(seq);
      set((state) => ({
        useInfoState: {
          ...state.useInfoState,
          user_profile_path: filePath || "",
        },
      }));
    } catch (error: any) {
      get().toggleAlert(error.message);
    }
  },

  updateInfo: async (formData: FormData) => {
    try {
      const res = await fetchApi({
        method: "POST",
        url: requests.UPDATE_INFO,
        body: formData,
      });

      console.log(res);
      alert(res);
      if (!res.resultCode) {
        get().toggleAlert(res.message);
      } else {
        get().setToast(res.message);
        get().fetchInfo();
      }
    } catch (error: any) {
      get().toggleAlert(error.message);
    }
  },
}));
