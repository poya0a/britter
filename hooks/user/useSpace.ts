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
import { usePost } from "../usePost";
import { useAlert } from "../popup/useAlert";
import { useCreatePopup } from "../popup/useCreatePopup";
import { useToast } from "../popup/useToast";
import { useSpaceSettingPopup } from "../popup/useSpaceSettingPopup";
import { useSettingMenu } from "../menu/useSettingMenu";

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

export const spaceState = atom<SpaceData[]>({
  key: "spaceState",
  default: [],
});

export const useSpace = () => {
  const queryClient = useQueryClient();
  const [useSpaceState, setUseSpaceState] =
    useRecoilState<SpaceData[]>(spaceState);

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

      return res.data;
    } catch (error) {
      if (error instanceof FetchError) {
        if (error.code === 403 || error.code === 401) {
          toggleRouteAlert({
            isActOpen: true,
            content: error.message,
            route: "/login",
          });
          storage.removeToken();
        } else {
          alert(error.message);
        }
      }
      throw error;
    }
  };

  const { data } = useQuery<SpaceData[], Error>({
    queryKey: ["space"],
    queryFn: fetchSpace,
    staleTime: 5 * 60 * 1000,
  });

  const { data: selectedSpace = "" } = useQuery<string>({
    queryKey: ["selectedSpace"],
    queryFn: () => {
      const data = queryClient.getQueryData<string>(["selectedSpace"]) ?? "";
      return data;
    },
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
          spaceList: [],
        });
        toggleSettingMenu(false);
        setSpace(res.data.spaceUid);
        queryClient.invalidateQueries({ queryKey: ["selectedSpace"] });
      }
    },
    onError: (error: any) => {
      toggleAlert(error);
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
    onError: (error: any) => {
      toggleAlert(error);
    },
  });

  useEffect(() => {
    const updateSpace = async () => {
      if (data) {
        const updatedList = await Promise.all(
          data.map(async (space: SpaceData) => {
            const space_profile_path = space.space_profile_seq
              ? await fetchFile(space.space_profile_seq)
              : "";
            return { ...space, space_profile_path };
          })
        );
        setUseSpaceState(updatedList);
        if (selectedSpace === "") {
          setSpace(data[0].UID);
        }
      }
    };

    updateSpace();
  }, [data, selectedSpace]);

  const setSpace = (uid: string) => {
    if (uid !== queryClient.getQueryData(["selectedSpace"])) {
      queryClient.setQueryData(["selectedSpace"], uid);
    }
  };

  return {
    useSpaceState,
    selectedSpace,
    setSpace,
    createSpace,
    deleteSpace,
  };
};
