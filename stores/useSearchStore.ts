import { create } from "zustand";
import fetchApi from "@fetch/fetch";
import storage from "@fetch/auth/storage";
import requests from "@fetch/requests";
import fetchFile from "@fetch/fetchFile";
import { useAlertStore } from "./popup/useAlertStore";
import convertHtmlToPreviewText from "@utils/previewText";
import { useInfoStore } from "./user/useInfoStore";
import { useSpaceStore } from "./user/useSpaceStore";

interface Notify {
  notifyUID: string;
  notifyType: string;
}

export interface UserData extends UserListData {
  user_hp: string;
  user_email: string;
  user_birth: number;
  create_date: Date;
  status_emoji?: string;
  status_message?: string;
}

export interface SpaceListData {
  UID: string;
  space_profile_seq: number;
  space_profile_path?: string;
  space_name: string;
  space_public: boolean;
  space_manager: string;
  notify?: Notify;
}

export interface UserListData {
  UID: string;
  user_id: string;
  user_profile_path?: string;
  user_profile_seq: number;
  user_name: string;
  user_public: boolean;
  notify?: Notify;
}

export interface PostListData {
  UID: string;
  seq: string;
  title: string;
  content: string;
  space_uid: string;
}

interface SearchPageNo {
  space: number;
  user: number;
  post: number;
}

interface LastPage {
  space: boolean;
  user: boolean;
  post: boolean;
}

export interface SearchData {
  searchWord?: string;
  spaceList?: SpaceListData[];
  userList?: UserListData[];
  postList?: PostListData[];
}

interface SearchStore {
  useSearchState: SearchData;
  searchPageNo: SearchPageNo;
  lastPage: LastPage;
  setUseSearchState: (newState: SearchData) => void;
  setSearchPageNo: (newPageNo: Partial<SearchPageNo>) => void;
  setLastPage: (newLastPage: Partial<LastPage>) => void;
  searchSpaceList: (searchWord: string) => Promise<void>;
  searchUserList: (searchWord: string) => Promise<void>;
  searchPostList: (searchWord: string) => Promise<void>;
  handleSearchSpace: (uid: string) => Promise<boolean>;
  handleSearchUser: (uid: string) => Promise<UserData | undefined>;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  useSearchState: {
    searchWord: "",
    spaceList: [],
    userList: [],
    postList: [],
  },
  searchPageNo: {
    space: 0,
    user: 0,
    post: 0,
  },
  lastPage: {
    space: false,
    user: false,
    post: false,
  },

  setUseSearchState: (newState: SearchData) =>
    set((state) => ({
      useSearchState: { ...state.useSearchState, ...newState },
    })),

  setSearchPageNo: (newPageNo: Partial<SearchPageNo>) =>
    set((state) => ({
      searchPageNo: { ...state.searchPageNo, ...newPageNo },
    })),

  setLastPage: (newLastPage: Partial<LastPage>) =>
    set((state) => ({
      lastPage: { ...state.lastPage, ...newLastPage },
    })),

  searchSpaceList: async (searchWord: string) => {
    set((state) => ({
      useSearchState: { ...state.useSearchState, searchWord },
    }));

    try {
      const res = await fetchApi({
        method: "POST",
        url: requests.SEARCH_SPACE_LIST,
        body: JSON.stringify({
          searchWord,
          page: get().searchPageNo.space + 1,
        }),
      });

      if (!res.resultCode) {
        const { toggleAlert } = useAlertStore.getState();
        toggleAlert(res.message);
      } else if (res.resultCode) {
        useUpdateSpaceList(res.data);
        set((state) => ({
          searchPageNo: {
            ...state.searchPageNo,
            space: res.pageInfo?.currentPage ?? state.searchPageNo.space,
          },
          lastPage: {
            ...state.lastPage,
            space: res.pageInfo?.currentPage === res.pageInfo?.totalPages,
          },
        }));
      }
    } catch (error: any) {
      const { toggleAlert } = useAlertStore.getState();
      toggleAlert(error.message);
    }
  },

  searchUserList: async (searchWord: string) => {
    set((state) => ({
      useSearchState: { ...state.useSearchState, searchWord },
    }));

    try {
      const res = await fetchApi({
        method: "POST",
        url: requests.SEARCH_USER_LIST,
        body: JSON.stringify({
          spaceUid: storage.getSpaceUid(),
          searchWord,
          page: get().searchPageNo.user + 1,
        }),
      });

      if (!res.resultCode) {
        const { toggleAlert } = useAlertStore.getState();
        toggleAlert(res.message);
      } else if (res.resultCode) {
        useUpdateUserList(res.data as UserListData[]);
        set((state) => ({
          searchPageNo: {
            ...state.searchPageNo,
            user: res.pageInfo?.currentPage ?? state.searchPageNo.user,
          },
          lastPage: {
            ...state.lastPage,
            user: res.pageInfo?.currentPage === res.pageInfo?.totalPages,
          },
        }));
      }
    } catch (error: any) {
      const { toggleAlert } = useAlertStore.getState();
      toggleAlert(error.message);
    }
  },

  searchPostList: async (searchWord: string) => {
    set((state) => ({
      useSearchState: { ...state.useSearchState, searchWord },
    }));

    try {
      const res = await fetchApi({
        method: "POST",
        url: requests.SEARCH_POST_LIST,
        body: JSON.stringify({ searchWord, page: get().searchPageNo.post + 1 }),
      });

      if (!res.resultCode) {
        const { toggleAlert } = useAlertStore.getState();
        toggleAlert(res.message);
      } else if (res.resultCode) {
        useUpdatePostList(
          res.data as PostListData[],
          get().useSearchState.searchWord ?? ""
        );
        set((state) => ({
          searchPageNo: {
            ...state.searchPageNo,
            post: res.pageInfo?.currentPage ?? state.searchPageNo.post,
          },
          lastPage: {
            ...state.lastPage,
            post: res.pageInfo?.currentPage === res.pageInfo?.totalPages,
          },
        }));
      }
    } catch (error: any) {
      const { toggleAlert } = useAlertStore.getState();
      toggleAlert(error.message);
    }
  },

  handleSearchSpace: async (uid: string): Promise<boolean> => {
    try {
      const res = await fetchApi({
        method: "GET",
        url: `${requests.GET_SPACE}?searchUid=${uid}`,
      });

      if (res?.data) {
        const { useInfoState } = useInfoStore.getState();
        const { setUseSelectedSpaceState } = useSpaceStore.getState();
        const includeSpace =
          res.data.space_manager === useInfoState.UID ||
          res.data.space_users?.includes(useInfoState.UID);

        if (!res.data.space_public && !includeSpace) {
          return false;
        } else {
          storage.setSpaceUid(res.data.UID);
          setUseSelectedSpaceState(res.data);
          return true;
        }
      } else {
        const { toggleAlert } = useAlertStore.getState();
        toggleAlert(res.message);
        return false;
      }
    } catch (error: any) {
      const { toggleAlert } = useAlertStore.getState();
      toggleAlert(error.message);
      return false;
    }
  },

  handleSearchUser: async (uid: string): Promise<UserData | undefined> => {
    try {
      const res = await fetchApi({
        method: "GET",
        url: `${requests.GET_USER}?searchUid=${uid}`,
      });

      if (res?.data) {
        const user_profile_path = await fetchFile(res.data.user_profile_seq);
        return { ...res.data, user_profile_path };
      } else {
        const { toggleAlert } = useAlertStore.getState();
        toggleAlert(res.message);
      }
    } catch (error: any) {
      const { toggleAlert } = useAlertStore.getState();
      toggleAlert(error.message);
    }
  },
}));

// Helper functions to update lists
const useUpdateSpaceList = async (spaceList: SpaceListData[]) => {
  const updatedList = await Promise.all(
    spaceList.map(async (space: SpaceListData) => {
      if (space.space_profile_seq !== null) {
        const space_profile_path = await fetchFile(space.space_profile_seq);
        return { ...space, space_profile_path };
      } else {
        return space;
      }
    })
  );

  const state = useSearchStore.getState();
  if (state.searchPageNo.space !== 0 && state.useSearchState.spaceList) {
    useSearchStore.setState({
      useSearchState: {
        ...state.useSearchState,
        spaceList: [...(state.useSearchState.spaceList ?? []), ...updatedList],
      },
    });
  } else {
    useSearchStore.setState({
      useSearchState: { ...state.useSearchState, spaceList: updatedList },
    });
  }
};

const useUpdateUserList = async (userList: UserListData[]) => {
  const updatedList = await Promise.all(
    userList.map(async (user: UserListData) => {
      if (
        user.user_profile_seq !== undefined &&
        user.user_profile_seq !== null
      ) {
        const user_profile_path = await fetchFile(user.user_profile_seq);
        return { ...user, user_profile_path };
      } else {
        return user;
      }
    })
  );

  const state = useSearchStore.getState();
  if (state.searchPageNo.user !== 0 && state.useSearchState.userList) {
    useSearchStore.setState({
      useSearchState: {
        ...state.useSearchState,
        userList: [...(state.useSearchState.userList ?? []), ...updatedList],
      },
    });
  } else {
    useSearchStore.setState({
      useSearchState: { ...state.useSearchState, userList: updatedList },
    });
  }
};

const useUpdatePostList = (postList: PostListData[], searchWord: string) => {
  const updatedList = postList.map((post: PostListData) => ({
    ...post,
    content: convertHtmlToPreviewText(post.content, searchWord),
  }));

  const state = useSearchStore.getState();
  if (state.searchPageNo.post !== 0 && state.useSearchState.postList) {
    useSearchStore.setState({
      useSearchState: {
        ...state.useSearchState,
        postList: [...(state.useSearchState.postList ?? []), ...updatedList],
      },
    });
  } else {
    useSearchStore.setState({
      useSearchState: { ...state.useSearchState, postList: updatedList },
    });
  }
};
