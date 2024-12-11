import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { atom, useRecoilState } from "recoil";
import { FetchError } from "@fetch/types";
import { useAlert } from "../popup/useAlert";
import { useToast } from "../popup/useToast";
import { useRouteAlert } from "../popup/useRouteAlert";
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
  unread_message_count?: number;
}

export const infoState = atom<InfoData>({
  key: "infoState",
  default: {
    UID: "",
    user_profile_seq: 0,
    user_id: "",
    user_name: "",
    user_hp: "",
    user_public: true,
    user_level: 1,
    create_date: new Date(),
  },
});

export const useInfo = () => {
  const queryClient = useQueryClient();
  const [useInfoState, setUseInfoState] = useRecoilState<InfoData>(infoState);
  const { toggleAlert } = useAlert();
  const { setToast } = useToast();
  const { toggleRouteAlert } = useRouteAlert();

  const fetchInfo = async (): Promise<InfoData> => {
    try {
      const res = await fetchApi({
        method: "GET",
        url: requests.USER_INFO,
      });
      if (!res) {
        throw new Error("데이터를 가져오는 데 실패했습니다.");
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

  const { data } = useQuery<InfoData, Error>({
    queryKey: ["info"],
    queryFn: fetchInfo,
    staleTime: 5 * 60 * 1000,
    enabled: !!storage.getAccessToken(),
  });

  const fetchDataAndUpdateState = async (seq: number) => {
    try {
      const filePath = await fetchFile(seq);
      setUseInfoState((prev) => ({
        ...prev,
        user_profile_path: filePath || "",
      }));
    } catch (error: any) {
      toggleAlert(error);
    }
  };

  useEffect(() => {
    if (data && useInfoState.UID !== data.UID) {
      setUseInfoState(data);
      if (useInfoState.user_profile_path === "") {
        fetchDataAndUpdateState(data.user_profile_seq);
      }
    }
  }, [data]);

  const { mutate: updateInfo } = useMutation({
    mutationFn: (formData: FormData) =>
      fetchApi({
        method: "POST",
        url: requests.UPDATE_INFO,
        body: formData,
      }),
    onSuccess: (res) => {
      if (!res.resultCode) {
        toggleAlert(res.message);
      } else {
        setToast(res.message);
        queryClient.invalidateQueries({ queryKey: ["info"] });
      }
    },
    onError: (error: FetchError) => {
      toggleAlert(error.message);
    },
  });

  return {
    useInfoState,
    updateInfo,
  };
};
