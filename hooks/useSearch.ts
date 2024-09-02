import { useEffect, useState } from "react";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRecoilState } from "recoil";
import { atom } from "recoil";
import { useAlert } from "./popup/useAlert";
import fetchFile from "@fetch/fetchFile";
import { useSpace } from "./user/useSpace";

export interface SpaceListData {
  UID: string;
  space_profile_seq: number;
  space_profile_path?: string;
  space_name: string;
  space_public: boolean;
  space_Request?: boolean;
}

export interface UserListData {
  UID: string;
  user_id: string;
  user_profile_path?: string;
  user_profile_seq: number;
  user_name: string;
  user_nick_name: string;
  user_public: boolean;
}

export interface PostListData {
  UID: string;
  space_profile_seq: number;
  space_profile_path?: string;
  space_name: string;
  space_public: boolean;
  space_Request?: boolean;
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
  spaceList?: SpaceListData[];
  userList?: UserListData[];
  postList?: PostListData[];
}

export const searchData = atom<SearchData>({
  key: "searchData",
  default: {
    spaceList: [],
    userList: [],
    postList: [],
  },
});

export const useSearch = () => {
  const queryClient = useQueryClient();
  const [useSearchState, setUseSearchState] =
    useRecoilState<SearchData>(searchData);
  const spaceUid = queryClient.getQueryData<string>(["selectedSpace"]);
  const { toggleAlert } = useAlert();
  const [searchPageNo, setSearchPageNo] = useState<{
    space: number;
    user: number;
    post: number;
  }>({
    space: 1,
    user: 1,
    post: 1,
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
    mutationFn: (searchWord: string) =>
      fetchApi({
        method: "POST",
        url: requests.SEARCH_SPACE_LIST,
        body: JSON.stringify({ searchWord, page: searchPageNo.space }),
      }),
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
      }
    },
    onError: (error: any) => {
      toggleAlert(error);
    },
  });

  const { mutate: searchUserList } = useMutation({
    mutationFn: (searchWord: string) =>
      fetchApi({
        method: "POST",
        url: requests.SEARCH_USER_LIST,
        body: JSON.stringify({ searchWord, page: searchPageNo.user }),
      }),
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
      }
    },
    onError: (error: any) => {
      toggleAlert(error);
    },
  });

  const { mutate: searchPostList } = useMutation({
    mutationFn: (searchWord: string) =>
      fetchApi({
        method: "POST",
        url: requests.SEARCH_POST_LIST,
        body: JSON.stringify({ searchWord, page: searchPageNo.post }),
      }),
    onSuccess: (res: SearchResponse) => {
      queryClient.invalidateQueries({ queryKey: ["searchPostList"] });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode) {
        queryClient.setQueryData(["searchPostList"], res.data);
        setSearchPageNo((prevState) => ({
          ...prevState,
          post: res.pageInfo?.currentPage ?? prevState.post,
        }));
      }
    },
    onError: (error: any) => {
      toggleAlert(error);
    },
  });

  const useUpdateSpaceList = async (spaceList: SpaceListData[]) => {
    const updatedList = await Promise.all(
      spaceList.map(async (space: SpaceListData) => {
        const space_profile_path = await fetchFile(space.space_profile_seq);
        return { ...space, space_profile_path };
      })
    );

    setUseSearchState({
      spaceList: updatedList,
    });
  };

  const useUpdateUserList = async (userList: UserListData[]) => {
    const updatedList = await Promise.all(
      userList.map(async (user: UserListData) => {
        const user_profile_path = await fetchFile(user.user_profile_seq);
        return { ...user, user_profile_path };
      })
    );

    setUseSearchState({
      userList: updatedList,
    });
  };

  //   const updateSpaceRequest = (spaceUid: string) => {
  //     setUseCreateState((prevState) => {
  //       if (prevState.spaceList) {
  //         const updatedSpaceList = prevState.spaceList.map((space) => {
  //           if (space.UID === spaceUid && space.space_Request !== true) {
  //             return { ...space, space_Request: true };
  //           }
  //           return space;
  //         });

  //         return {
  //           ...prevState,
  //           spaceList: updatedSpaceList,
  //         };
  //       }
  //       return prevState;
  //     });
  //   };

  return {
    useSearchState,
    searchSpaceList,
    searchUserList,
    searchPostList,
  };
};
