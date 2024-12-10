import { useState } from "react";
import { FetchError } from "@fetch/types";
import fetchApi from "@fetch/fetch";
import storage from "@fetch/auth/storage";
import requests from "@fetch/requests";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRecoilState } from "recoil";
import { atom } from "recoil";
import { useAlert } from "./popup/useAlert";
import fetchFile from "@fetch/fetchFile";
import convertHtmlToPreviewText from "@utils/previewText";
import { useInfo } from "./user/useInfo";
import { SpaceData } from "./user/useSpace";

export interface Notify {
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

interface SearchResponse {
  message: string;
  data?: SpaceListData[] | UserListData[] | PostListData[];
  pageInfo?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  resultCode: boolean;
}

interface SearchData {
  searchWord?: string;
  spaceList?: SpaceListData[];
  userList?: UserListData[];
  postList?: PostListData[];
}

export const searchData = atom<SearchData>({
  key: "searchData",
  default: {
    searchWord: "",
    spaceList: [],
    userList: [],
    postList: [],
  },
});

export const useSearch = () => {
  const queryClient = useQueryClient();
  const [useSearchState, setUseSearchState] =
    useRecoilState<SearchData>(searchData);
  const { useInfoState } = useInfo();
  const { toggleAlert } = useAlert();
  const [searchPageNo, setSearchPageNo] = useState<{
    space: number;
    user: number;
    post: number;
  }>({
    space: 0,
    user: 0,
    post: 0,
  });
  const [lastPage, setLastPage] = useState<{
    space: boolean;
    user: boolean;
    post: boolean;
  }>({
    space: false,
    user: false,
    post: false,
  });

  const { data: spaceList } = useQuery<SpaceListData[], Error>({
    queryKey: ["searchSpaceList"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: userList } = useQuery<UserListData[], Error>({
    queryKey: ["searchUserList"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: postList } = useQuery<PostListData[], Error>({
    queryKey: ["searchPostList"],
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: searchSpaceList } = useMutation({
    mutationFn: (searchWord: string) => {
      setUseSearchState((prevState) => ({
        ...prevState,
        searchWord: searchWord,
      }));
      return fetchApi({
        method: "POST",
        url: requests.SEARCH_SPACE_LIST,
        body: JSON.stringify({ searchWord, page: searchPageNo.space + 1 }),
      });
    },
    onSuccess: (res: SearchResponse) => {
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode) {
        queryClient.setQueryData(["searchSpaceList"], res.data);
        useUpdateSpaceList(res.data as SpaceListData[]);
        setSearchPageNo((prevState) => ({
          ...prevState,
          space: res.pageInfo?.currentPage ?? prevState.space,
        }));
        setLastPage((prevState) => ({
          ...prevState,
          space: res.pageInfo?.currentPage === res.pageInfo?.totalPages,
        }));
      }
    },
    onError: (error: FetchError) => {
      toggleAlert(error.message);
    },
  });

  const { mutate: searchUserList } = useMutation({
    mutationFn: (searchWord: string) => {
      setUseSearchState((prevState) => ({
        ...prevState,
        searchWord: searchWord,
      }));
      const spaceUid = queryClient.getQueryData<SpaceData>([
        "selectedSpace",
      ])?.UID;
      return fetchApi({
        method: "POST",
        url: requests.SEARCH_USER_LIST,
        body: JSON.stringify({
          spaceUid: spaceUid,
          searchWord,
          page: searchPageNo.user + 1,
        }),
      });
    },
    onSuccess: (res: SearchResponse) => {
      queryClient.invalidateQueries({ queryKey: ["searchUserList"] });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode) {
        queryClient.setQueryData(["searchUserList"], res.data);
        useUpdateUserList(res.data as UserListData[]);
        setSearchPageNo((prevState) => ({
          ...prevState,
          user: res.pageInfo?.currentPage ?? prevState.user,
        }));
        setLastPage((prevState) => ({
          ...prevState,
          user: res.pageInfo?.currentPage === res.pageInfo?.totalPages,
        }));
      }
    },
    onError: (error: FetchError) => {
      toggleAlert(error.message);
    },
  });

  const { mutate: searchPostList } = useMutation({
    mutationFn: (searchWord: string) => {
      setUseSearchState((prevState) => ({
        ...prevState,
        searchWord: searchWord,
      }));
      return fetchApi({
        method: "POST",
        url: requests.SEARCH_POST_LIST,
        body: JSON.stringify({ searchWord, page: searchPageNo.post + 1 }),
      });
    },
    onSuccess: (res: SearchResponse) => {
      queryClient.invalidateQueries({ queryKey: ["searchPostList"] });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode) {
        queryClient.setQueryData(["searchPostList"], res.data);
        useUpdatePostList(
          res.data as PostListData[],
          useSearchState.searchWord ?? ""
        );
        setSearchPageNo((prevState) => ({
          ...prevState,
          post: res.pageInfo?.currentPage ?? prevState.post,
        }));
        setLastPage((prevState) => ({
          ...prevState,
          post: res.pageInfo?.currentPage === res.pageInfo?.totalPages,
        }));
      }
    },
    onError: (error: FetchError) => {
      toggleAlert(error.message);
    },
  });

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

    if (searchPageNo.space !== 0 && useSearchState.spaceList) {
      setUseSearchState((prevState) => ({
        ...prevState,
        spaceList: [...(prevState.spaceList ?? []), ...updatedList],
      }));
    } else {
      setUseSearchState((prevState) => ({
        ...prevState,
        spaceList: updatedList,
      }));
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

    if (searchPageNo.user !== 0 && useSearchState.userList) {
      setUseSearchState((prevState) => ({
        ...prevState,
        userList: [...(prevState.userList ?? []), ...updatedList],
      }));
    } else {
      setUseSearchState((prevState) => ({
        ...prevState,
        userList: updatedList,
      }));
    }
  };

  const useUpdatePostList = async (
    postList: PostListData[],
    searchWord: string
  ) => {
    const updatedList = await Promise.all(
      postList.map(async (post: PostListData) => {
        const content = convertHtmlToPreviewText(post.content, searchWord);
        return { ...post, content: content };
      })
    );

    if (searchPageNo.post !== 0 && useSearchState.postList) {
      setUseSearchState((prevState) => ({
        ...prevState,
        postList: [...(prevState.postList ?? []), ...updatedList],
      }));
    } else {
      setUseSearchState((prevState) => ({
        ...prevState,
        postList: updatedList,
      }));
    }
  };

  // 스페이스 검색 후 이동 시 선택한 스페이스 업데이트
  const handleSearchSpace = async (uid: string) => {
    const res = await fetchApi({
      method: "GET",
      url: `${requests.GET_SPACE}?searchUid=${uid}`,
    });

    if (res?.data) {
      // 내가 해당된 스페이스는 제외
      const includeSpace =
        res.data.space_manager === useInfoState.UID ||
        res.data.space_users?.includes(useInfoState.UID);

      if (!res.data.space_public && !includeSpace) {
        return false;
      } else {
        queryClient.setQueryData(["selectedSpace"], res.data);
        // 게시물 목록 및 멤버 업데이트에 사용
        storage.setSpaceUid(res.data.UID);
        return true;
      }
    } else {
      toggleAlert(res.message);
    }
  };

  const handleSearchUser = async (
    uid: string
  ): Promise<UserData | undefined> => {
    const res = await fetchApi({
      method: "GET",
      url: `${requests.GET_USER}?searchUid=${uid}`,
    });

    if (res?.data) {
      const user_profile_path = await fetchFile(res.data.user_profile_seq);
      return { ...res.data, user_profile_path };
    } else {
      toggleAlert(res.message);
    }
  };

  return {
    useSearchState,
    setUseSearchState,
    setSearchPageNo,
    searchSpaceList,
    searchUserList,
    searchPostList,
    lastPage,
    handleSearchSpace,
    handleSearchUser,
  };
};
