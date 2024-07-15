import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRecoilState } from "recoil";
import { atom } from "recoil";
import { useAlert } from "./useAlert";
import { useEffect } from "react";
import fetchFile from "@fetch/fetchFile";
import { useSpace } from "../user/useSpace";

export interface SpaceListData {
  UID: string;
  space_profile_seq: number;
  space_profile_path?: string;
  space_name: string;
  space_public: boolean;
  space_Request?: boolean;
}

interface SearchSpaceListResponse {
  message: string;
  data?: SpaceListData[];
  resultCode: boolean;
}

interface CreateData {
  isActOpen: boolean;
  mode: string;
  spaceList?: SpaceListData[];
}

export const createState = atom<CreateData>({
  key: "createState",
  default: {
    isActOpen: false,
    mode: "",
    spaceList: [],
  },
});

export const useCreatePopup = () => {
  const queryClient = useQueryClient();
  const [useCreateState, setUseCreateState] =
    useRecoilState<CreateData>(createState);
  const { toggleAlert } = useAlert();

  const toggleCreatePopup = (props: CreateData | boolean) => {
    if (!props) {
      setUseCreateState({ isActOpen: false, mode: "" });
    } else if (typeof props !== "boolean" && props) {
      setUseCreateState({ isActOpen: props.isActOpen, mode: props.mode });
    }
  };

  const { data: spaceList } = useQuery<SpaceListData[], Error>({
    queryKey: ["searchSpaceList"],
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: searchSpaceList } = useMutation({
    mutationFn: (searchWord: string) =>
      fetchApi({
        method: "POST",
        url: requests.GET_SPACE_LIST,
        body: JSON.stringify({ searchWord }),
      }),
    onSuccess: (res: SearchSpaceListResponse) => {
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

  useEffect(() => {
    const updateSpaceList = async () => {
      if (spaceList) {
        const updatedList = await Promise.all(
          spaceList.map(async (space: SpaceListData) => {
            const space_profile_path = await fetchFile(space.space_profile_seq);
            return { ...space, space_profile_path };
          })
        );
        setUseCreateState({
          isActOpen: useCreateState.isActOpen,
          mode: useCreateState.mode,
          spaceList: updatedList,
        });
      }
    };

    updateSpaceList();
  }, [spaceList]);

  const updateSpaceRequest = (spaceUid: string) => {
    setUseCreateState((prevState) => {
      if (prevState.spaceList) {
        const updatedSpaceList = prevState.spaceList.map((space) => {
          if (space.UID === spaceUid && space.space_Request !== true) {
            return { ...space, space_Request: true };
          }
          return space;
        });

        return {
          ...prevState,
          spaceList: updatedSpaceList,
        };
      }
      return prevState;
    });
  };

  return {
    useCreateState,
    toggleCreatePopup,
    spaceList,
    searchSpaceList,
    updateSpaceRequest,
  };
};
