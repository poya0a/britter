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
  user_nick_name: string;
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

  const { toggleAlert } = useAlert();
  const { setToast } = useToast();
  const { toggleRouteAlert } = useRouteAlert();
  const { toggleCreatePopup } = useCreatePopup();
  const { toggleSettingMenu } = useSettingMenu();
  const { toggleSpaceSettingPopup } = useSpaceSettingPopup();

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
  });

  const { data: selectedSpace } = useQuery<SpaceData>({
    queryKey: ["selectedSpace"],
    queryFn: () => {
      return (
        queryClient.getQueryData<SpaceData>(["selectedSpace"]) ?? {
          UID: "",
          space_profile_seq: 0,
          space_profile_path: "",
          space_name: "",
          space_manager: "",
          space_public: false,
          space_users: [],
        }
      );
    },
  });

  const { data: spaceMember } = useQuery<SpaceMemberData[], Error>({
    queryKey: ["spaceMember"],
    staleTime: 5 * 60 * 1000,
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
        setSpace(res.data.spaceUid);
        queryClient.invalidateQueries({ queryKey: ["selectedSpace"] });
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
        body: JSON.stringify({ spaceUid: selectedSpace }),
      }),
    onSuccess: (res: SpaceListResponse) => {
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else {
        setSpace("");
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
    mutationFn: () =>
      fetchApi({
        method: "POST",
        url: requests.GET_SPACE_MEMBER_LIST,
        body: JSON.stringify({ spaceUid: selectedSpace?.UID }),
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
      toggleAlert(error.message);
    },
  });

  useEffect(() => {
    const updateSpace = async () => {
      if (space) {
        const updatedList = await Promise.all(
          space.map(async (space: SpaceData) => {
            const space_profile_path = space.space_profile_seq
              ? await fetchFile(space.space_profile_seq)
              : "";
            return { ...space, space_profile_path };
          })
        );
        setUseSpaceState(updatedList);
        if (!selectedSpace?.UID) {
          setSpace(space[0].UID);
        }
      }
    };

    updateSpace();
  }, [space, selectedSpace]);

  const setSpace = (uid: string) => {
    if (uid !== queryClient.getQueryData(["selectedSpace"])) {
      if (useSpaceState.length > 0) {
        const findSpace =
          useSpaceState.find((space) => space.UID === uid) || {};
        queryClient.setQueryData(["selectedSpace"], findSpace);
      } else {
        const spaceData = queryClient.getQueryData(["space"]);

        const findSpace = Array.isArray(spaceData)
          ? spaceData.find((space) => space.UID === uid)
          : {};

        queryClient.setQueryData(["selectedSpace"], findSpace);
      }
      fetchSpaceMember();
    }
  };

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
  }, [spaceMember, selectedSpace]);

  return {
    useSpaceState,
    useSpaceMemeberState,
    selectedSpace,
    spaceMember,
    spacePageInfo,
    spaceMemeberPageInfo,
    setSpace,
    createSpace,
    updateSpace,
    deleteSpace,
  };
};
