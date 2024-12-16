import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import fetchFile from "@fetch/fetchFile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { atom } from "recoil";
import { FetchError } from "@fetch/types";
import { useRouteAlert } from "../popup/useRouteAlert";
import storage from "@fetch/auth/storage";
import { useAlert } from "../popup/useAlert";
import { useCreatePopup } from "../popup/useCreatePopup";
import { useToast } from "../popup/useToast";
import { useSpaceSettingPopup } from "../popup/useSpaceSettingPopup";
import { useSettingMenu } from "../menu/useSettingMenu";
import { useSearch } from "../useSearch";
import { useUpdateEffect } from "@utils/useUpdateEffect";

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
  space_users: string[];
  space_content?: string;
  notify?: {
    notifyUID: string;
    notifyType: string;
  };
}

interface SpaceListResponse {
  message: string;
  data?: { spaceUid: string };
  resultCode: boolean;
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

interface SpaceMemberListResponse {
  message: string;
  data?: SpaceMemberData[];
  pageInfo?: PageInfo;
  resultCode: boolean;
}

export const spaceState = atom<SpaceData[]>({
  key: "spaceState",
  default: [],
});

export const spaceMemberState = atom<SpaceMemberData[]>({
  key: "spaceMemberState",
  default: [],
});

export const pageInfo = atom<PageInfo>({
  key: "pageInfo",
  default: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 1,
  },
});

export const useSpace = () => {
  const queryClient = useQueryClient();
  const [useSpaceState, setUseSpaceState] =
    useRecoilState<SpaceData[]>(spaceState);
  const [spacePageInfo, setSpacePageInfo] = useRecoilState<PageInfo>(pageInfo);
  const [useSpaceMemeberState, setUseSpaceMemeberState] =
    useRecoilState<SpaceMemberData[]>(spaceMemberState);
  const [spaceMemeberPageInfo, setSpaceMemeberPageInfo] =
    useRecoilState<PageInfo>(pageInfo);

  const selectedSpaceUid = storage.getSpaceUid();
  const { toggleAlert } = useAlert();
  const { setToast } = useToast();
  const { toggleRouteAlert } = useRouteAlert();
  const { toggleCreatePopup } = useCreatePopup();
  const { toggleSettingMenu } = useSettingMenu();
  const { toggleSpaceSettingPopup } = useSpaceSettingPopup();
  const { handleSearchSpace } = useSearch();

  const fetchSpace = async (): Promise<SpaceData[]> => {
    try {
      const res = await fetchApi({
        method: "GET",
        url: requests.USER_SPACE_LIST,
      });

      if (!res.resultCode) {
        throw new Error(res.message);
      }

      if (res.pageInfo) {
        setSpacePageInfo(res.pageInfo);
      }

      return res.data;
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
  };

  const { data: space } = useQuery<SpaceData[], Error>({
    queryKey: ["space"],
    queryFn: fetchSpace,
    staleTime: 5 * 60 * 1000,
    enabled: !!storage.getAccessToken(),
  });

  const { data: selectedSpace } = useQuery<SpaceData>({
    queryKey: ["selectedSpace"],
    staleTime: 5 * 60 * 1000,
    enabled: !!storage.getAccessToken(),
  });

  const { data: spaceMember } = useQuery<SpaceMemberData[], Error>({
    queryKey: ["spaceMember"],
    staleTime: 5 * 60 * 1000,
    enabled: !!storage.getAccessToken(),
  });

  const { mutate: createSpace } = useMutation({
    mutationFn: (spaceName: string) =>
      fetchApi({
        method: "POST",
        url: requests.SAVE_SPACE,
        body: JSON.stringify({ spaceName }),
      }),
    onSuccess: (res: SpaceListResponse) => {
      queryClient.invalidateQueries({ queryKey: ["space"] });
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
    },
    onError: (error: FetchError) => {
      toggleAlert(error.message);
    },
  });

  const { mutate: updateSpace } = useMutation({
    mutationFn: (formData: FormData) =>
      fetchApi({
        method: "POST",
        url: requests.UPDATE_SPACE,
        body: formData,
      }),
    onSuccess: (res: SpaceListResponse) => {
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else {
        setToast(res.message);
        queryClient.invalidateQueries({ queryKey: ["space"] });
      }
    },
    onError: (error: FetchError) => {
      toggleAlert(error.message);
    },
  });

  const { mutate: deleteSpace } = useMutation({
    mutationFn: () =>
      fetchApi({
        method: "POST",
        url: requests.DELETE_SPACE,
        body: JSON.stringify({ spaceUid: selectedSpace?.UID }),
      }),
    onSuccess: (res: SpaceListResponse) => {
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else {
        storage.removeStorage("space-uid");
        toggleSpaceSettingPopup(false);
        setToast(res.message);
        queryClient.invalidateQueries({ queryKey: ["space"] });
      }
    },
    onError: (error: FetchError) => {
      toggleAlert(error.message);
    },
  });

  const { mutate: fetchSpaceMember } = useMutation({
    mutationFn: (uid: string) =>
      fetchApi({
        method: "POST",
        url: requests.GET_SPACE_MEMBER_LIST,
        body: JSON.stringify({ spaceUid: uid }),
      }),
    onSuccess: (res: SpaceMemberListResponse) => {
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else {
        if (res.data && res.pageInfo) {
          queryClient.setQueryData(["spaceMember"], res.data);
          setSpaceMemeberPageInfo(res.pageInfo);
        }
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

  const saveSpaceContent = async (formData: FormData): Promise<boolean> => {
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
  };

  const deleteSpaceContent = async (uid: string) => {
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
  };

  useUpdateEffect(() => {
    const updateSpace = async () => {
      if (space) {
        const updatedList = await Promise.all(
          space.map(async (space: SpaceData) => {
            const space_profile_path =
              (!space.space_profile_path || space.space_profile_path !== "") &&
              space.space_profile_seq
                ? await fetchFile(space.space_profile_seq)
                : space.space_profile_path;
            return { ...space, space_profile_path };
          })
        );
        setUseSpaceState(updatedList);
        if (!selectedSpaceUid) {
          storage.setSpaceUid(space[0].UID);
          const findSpace =
            updatedList.find((item) => item.UID === space[0].UID) || {};
          queryClient.setQueryData(["selectedSpace"], findSpace);
        } else {
          const findSpace = updatedList.find(
            (item) => item.UID === selectedSpaceUid
          );
          if (findSpace) {
            queryClient.setQueryData(["selectedSpace"], findSpace);
          } else {
            handleSearchSpace(selectedSpaceUid);
          }
        }
      }
    };

    updateSpace();
  }, [space]);

  // 스페이스 검색 및 선택
  useEffect(() => {
    if (
      selectedSpaceUid &&
      useSpaceState.length > 0 &&
      selectedSpaceUid !== selectedSpace?.UID
    ) {
      // 참여한 스페이스 목록에서 선택한 경우
      const findSpace =
        useSpaceState.find((space) => space.UID === selectedSpaceUid) || {};

      if (findSpace) {
        queryClient.setQueryData(["selectedSpace"], findSpace);
      }
      // 스페이스 검색 및 선택으로 스페이스 멤버 목록
      fetchSpaceMember(selectedSpaceUid);
    }
  }, [selectedSpaceUid]);

  useEffect(() => {
    const updateSpaceMember = async () => {
      if (spaceMember) {
        const updatedList = await Promise.all(
          spaceMember.map(async (member: SpaceMemberData) => {
            const user_profile_path = member.user_profile_seq
              ? await fetchFile(member.user_profile_seq)
              : "";
            return { ...member, user_profile_path };
          })
        );
        setUseSpaceMemeberState(updatedList);
      }
    };

    updateSpaceMember();
  }, [selectedSpace]);

  return {
    useSpaceState,
    useSpaceMemeberState,
    selectedSpace,
    spaceMember,
    spacePageInfo,
    spaceMemeberPageInfo,
    createSpace,
    updateSpace,
    deleteSpace,
    saveSpaceContent,
    deleteSpaceContent,
  };
};
