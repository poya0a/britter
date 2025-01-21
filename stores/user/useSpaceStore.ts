import { create } from "zustand";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import fetchFile from "@fetch/fetchFile";
import { FetchError } from "@fetch/types";
import storage from "@fetch/auth/storage";
import { useAlertStore } from "../popup/useAlertStore";
import { useToastStore } from "../popup/useToastStore";
import { useRouteAlertStore } from "../popup/useRouteAlertStore";
import { useCreatePopupStore } from "../popup/useCreatePopupStore";
import { useSpaceSettingPopupStore } from "../popup/useSpaceSettingPopupStore";
import { useSettingMenuStore } from "../menu/useSettingMenuStore";
import { useSearchStore } from "../useSearchStore";
import { usePostStore } from "./usePostStore";
import { useInfoStore } from "./useInfoStore";

interface PageInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface SpaceData {
  UID: string;
  space_profile_seq: number;
  space_profile_path: string;
  space_name: string;
  space_manager: string;
  space_public: boolean;
  space_users: string[] | null;
  space_content?: string;
  notify?: {
    notifyUID: string;
    notifyType: string;
  };
}

export interface SpaceMemberData {
  UID: string;
  roll: string;
  user_profile_seq: number;
  user_profile_path?: string;
  user_id: string;
  user_name: string;
  user_hp: string;
  user_email?: string;
  user_birth?: string;
  user_public: boolean;
  status_emoji?: string;
  status_message?: string;
}

interface SpaceStore {
  useSpaceState: SpaceData[];
  useSelectedSpaceState: SpaceData;
  spacePageInfo: PageInfo;
  useSpaceMemeberState: SpaceMemberData[];
  spaceMemeberPageInfo: PageInfo;
  fetchSpace: () => Promise<void>;
  createSpace: (spaceName: string) => Promise<void>;
  updateSpace: (formData: FormData) => Promise<void>;
  deleteSpace: () => Promise<void>;
  saveSpaceContent: (formData: FormData) => Promise<boolean>;
  deleteSpaceContent: (uid: string) => Promise<boolean>;
  setUseSpaceState: (spaces: SpaceData[]) => void;
  setUseSelectedSpaceState: (space: SpaceData) => void;
  setSpacePageInfo: (pageInfo: PageInfo) => void;
  setUseSpaceMemeberState: (spaceUid: string, page: number, searchWord?: string) => Promise<void>;
  setSpaceMemeberPageInfo: (pageInfo: PageInfo) => void;
}

export const useSpaceStore = create<SpaceStore>((set) => ({
  useSpaceState: [],
  useSelectedSpaceState: {
    UID: "",
    space_profile_seq: 0,
    space_profile_path: "",
    space_name: "",
    space_manager: "",
    space_public: false,
    space_users: [],
  },
  spacePageInfo: {
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
  },
  useSpaceMemeberState: [],
  spaceMemeberPageInfo: {
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
  },
  setUseSpaceState: (spaces) => set({ useSpaceState: spaces }),
  setUseSelectedSpaceState: (space) => {
    const { fetchPostList } = usePostStore.getState();
    set({ useSelectedSpaceState: space });
    fetchPostList(space.UID);
    useSpaceStore.getState().setUseSpaceMemeberState(space.UID, 0);
  },
  setSpacePageInfo: (pageInfo) => set({ spacePageInfo: pageInfo }),
  setSpaceMemeberPageInfo: (pageInfo) => set({ spaceMemeberPageInfo: pageInfo }),

  fetchSpace: async () => {
    const { toggleRouteAlert } = useRouteAlertStore.getState();
    const { handleSearchSpace } = useSearchStore.getState();
    const { fetchPostList } = usePostStore.getState();
    const selectedSpaceUid = storage.getSpaceUid();
    try {
      const res = await fetchApi({
        method: "GET",
        url: requests.USER_SPACE_LIST,
      });

      if (!res.resultCode) {
        throw new Error(res.message);
      }

      if (res.pageInfo) {
        useSpaceStore.getState().setSpacePageInfo(res.pageInfo);
      }

      const updatedList = await Promise.all(
        res.data.map(async (space: SpaceData) => {
          const space_profile_path =
            (!space.space_profile_path || space.space_profile_path !== "") && space.space_profile_seq
              ? await fetchFile(space.space_profile_seq)
              : space.space_profile_path;
          return { ...space, space_profile_path };
        })
      );
      useSpaceStore.getState().setUseSpaceState(updatedList);

      if (!selectedSpaceUid) {
        const recentSpaceUid = useInfoStore.getState().useInfoState.recent_space
          ? res.data[0].UID
          : useInfoStore.getState().useInfoState.recent_space;

        storage.setSpaceUid(recentSpaceUid);
        const findSpace = updatedList.find((item) => item.UID === recentSpaceUid) || {};

        useSpaceStore.getState().setUseSelectedSpaceState(findSpace);
        fetchPostList(recentSpaceUid);
        useSpaceStore.getState().setUseSpaceMemeberState(recentSpaceUid, 0);
      } else {
        const findSpace = updatedList.find((item) => item.UID === selectedSpaceUid);
        if (findSpace) {
          useSpaceStore.getState().setUseSelectedSpaceState(findSpace);
        } else {
          handleSearchSpace(selectedSpaceUid);
        }
        fetchPostList(selectedSpaceUid);
      }
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
  },

  setUseSpaceMemeberState: async (spaceUid, page, searchWord) => {
    const { toggleAlert } = useAlertStore.getState();
    try {
      const res = await fetchApi({
        method: "POST",
        url: requests.POST_SPACE_MEMBER_LIST,
        body: JSON.stringify({ spaceUid, page: page + 1, searchWord }),
      });

      if (!res.resultCode) {
        throw new Error(res.message);
      }

      if (res.pageInfo) {
        useSpaceStore.getState().setSpaceMemeberPageInfo(res.pageInfo);
      }

      const updatedList = await Promise.all(
        res.data.map(async (mem: SpaceMemberData) => {
          const user_profile_path =
            (!mem.user_profile_path || mem.user_profile_path !== "") && mem.user_profile_seq
              ? await fetchFile(mem.user_profile_seq)
              : mem.user_profile_path;
          return { ...mem, user_profile_path };
        })
      );

      if (page !== 0) {
        const memberList = useSpaceStore.getState().useSpaceMemeberState;
        set({ useSpaceMemeberState: [...memberList, ...updatedList] });
      } else {
        set({ useSpaceMemeberState: updatedList });
      }
    } catch (error: any) {
      toggleAlert(error.message);
    }
  },

  createSpace: async (spaceName: string) => {
    const { toggleAlert } = useAlertStore.getState();
    const { toggleCreatePopup } = useCreatePopupStore.getState();
    const { toggleSettingMenu } = useSettingMenuStore.getState();
    try {
      const res = await fetchApi({
        method: "POST",
        url: requests.SAVE_SPACE,
        body: JSON.stringify({ spaceName }),
      });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode && res.data) {
        toggleCreatePopup({
          isActOpen: false,
          mode: "",
        });
        toggleSettingMenu(false);
        storage.setSpaceUid(res.data.spaceUid);
      }
    } catch (error: any) {
      toggleAlert(error.message);
    }
  },

  updateSpace: async (formData: FormData) => {
    const { toggleAlert } = useAlertStore.getState();
    const { setToast } = useToastStore.getState();
    try {
      const res = await fetchApi({
        method: "POST",
        url: requests.UPDATE_SPACE,
        body: formData,
      });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else {
        setToast(res.message);
        useSpaceStore.getState().fetchSpace();
      }
    } catch (error: any) {
      toggleAlert(error.message);
    }
  },

  deleteSpace: async () => {
    const { toggleAlert } = useAlertStore.getState();
    const { setToast } = useToastStore.getState();
    const { toggleSpaceSettingPopup } = useSpaceSettingPopupStore.getState();
    try {
      const res = await fetchApi({
        method: "POST",
        url: requests.DELETE_SPACE,
        body: JSON.stringify({
          spaceUid: useSpaceStore.getState().useSelectedSpaceState.UID,
        }),
      });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else {
        storage.removeStorage("space-uid");
        toggleSpaceSettingPopup(false);
        setToast(res.message);
        useSpaceStore.getState().fetchSpace();
      }
    } catch (error: any) {
      toggleAlert(error.message);
    }
  },

  saveSpaceContent: async (formData: FormData): Promise<boolean> => {
    const { toggleAlert } = useAlertStore.getState();
    const { setToast } = useToastStore.getState();
    const { handleSearchSpace } = useSearchStore.getState();
    try {
      const res = await fetchApi({
        method: "POST",
        url: requests.POST_SPACE_CONTENT,
        body: formData,
      });

      if (!res.resultCode) {
        toggleAlert(res.message);
        return false;
      } else if (res.resultCode && res.data) {
        setToast(res.message);
        handleSearchSpace(res.data.uid);
        return true;
      }
      return false;
    } catch (error: any) {
      toggleAlert(error.message);
      return false;
    }
  },

  deleteSpaceContent: async (uid: string): Promise<boolean> => {
    const { toggleAlert } = useAlertStore.getState();
    const { setToast } = useToastStore.getState();
    const { handleSearchSpace } = useSearchStore.getState();
    try {
      const res = await fetchApi({
        method: "POST",
        url: requests.DELETE_SPACE_CONTENT,
        body: JSON.stringify({ spaceUid: uid }),
      });

      if (!res.resultCode) {
        toggleAlert(res.message);
        return false;
      } else if (res.resultCode && res.data) {
        setToast(res.message);
        handleSearchSpace(res.data.uid);
        return true;
      }
      return false;
    } catch (error: any) {
      toggleAlert(error.message);
      return false;
    }
  },
}));
