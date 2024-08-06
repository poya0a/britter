import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRecoilState } from "recoil";
import { atom } from "recoil";
import { useAlert } from "./popup/useAlert";
import { useEffect } from "react";
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
  space_profile_seq: number;
  space_profile_path?: string;
  space_name: string;
  space_public: boolean;
  space_Request?: boolean;
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
        body: JSON.stringify({ searchWord }),
      }),
    onSuccess: (res: SearchResponse) => {
      queryClient.invalidateQueries({ queryKey: ["searchSpaceList"] });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode) {
        queryClient.setQueryData(["searchSpaceList"], res.data);
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
        body: JSON.stringify({ searchWord }),
      }),
    onSuccess: (res: SearchResponse) => {
      queryClient.invalidateQueries({ queryKey: ["searchUserList"] });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode) {
        queryClient.setQueryData(["searchUserList"], res.data);
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
        body: JSON.stringify({ searchWord }),
      }),
    onSuccess: (res: SearchResponse) => {
      queryClient.invalidateQueries({ queryKey: ["searchPostList"] });
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else if (res.resultCode) {
        queryClient.setQueryData(["searchPostList"], res.data);
      }
    },
    onError: (error: any) => {
      toggleAlert(error);
    },
  });

  useEffect(() => {
    const updateSpaceList = async () => {
      if (spaceList) {
        const updatedList = await Promise.all(
          spaceList.map(async (space: SpaceListData) => {
            const space_profile_path = await fetchFile(space.space_profile_seq);
            return { ...space, space_profile_path };
          })
        );
        setUseSearchState({
          spaceList: updatedList,
        });
      }
    };

    updateSpaceList();
  }, [spaceList]);

  useEffect(() => {
    const updateUserList = async () => {
      if (userList) {
        const updatedList = await Promise.all(
          userList.map(async (user: UserListData) => {
            const space_profile_path = await fetchFile(user.space_profile_seq);
            return { ...user, space_profile_path };
          })
        );
        setUseSearchState({
          userList: updatedList,
        });
      }
    };

    updateUserList();
  }, [userList]);

  useEffect(() => {
    const updatePostList = async () => {
      if (postList) {
        const updatedList = await Promise.all(
          postList.map(async (post: PostListData) => {
            const space_profile_path = await fetchFile(post.space_profile_seq);
            return { ...post, space_profile_path };
          })
        );
        setUseSearchState({
          postList: updatedList,
        });
      }
    };

    updatePostList();
  }, [postList]);
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
    spaceList,
    searchSpaceList,
    searchUserList,
    searchPostList,
  };
};
