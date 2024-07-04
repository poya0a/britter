import fetchApi from "@/app/fetch/fetch";
import requests from "@/app/fetch/requests";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { atom } from "recoil";
import { useAlert } from "./popup/useAlert";

export interface InfoData {
  user_profile_seq: number;
  user_profile_path?: string;
  user_id: string;
  user_name: string;
  user_hp: string;
  user_email?: string;
  user_nick_name?: string;
  user_birth?: string;
  create_date: Date;
  status_emoji?: string;
  status_message?: string;
}

export const infoState = atom<InfoData>({
  key: "infoState",
  default: {
    user_profile_seq: 0,
    user_profile_path: "",
    user_id: "",
    user_name: "",
    user_hp: "",
    user_email: "",
    user_nick_name: "",
    user_birth: "",
    create_date: new Date(),
    status_emoji: "",
    status_message: "",
  },
});

export const useInfo = () => {
  const [useInfoState, setUseInfoState] = useRecoilState<InfoData>(infoState);
  const { toggleAlert } = useAlert();

  const fetchInfo = async (): Promise<InfoData> => {
    const res = await fetchApi({
      method: "GET",
      url: requests.USER_INFO,
    });

    if (!res.resultCode) {
      throw new Error(res.message);
    }

    return res.data;
  };

  const fetchFile = async (seq: number): Promise<void> => {
    try {
      const res = await fetchApi({
        method: "GET",
        url: `${requests.GET_FILE}?seq=${seq}`,
      });

      if (!res.resultCode) {
        throw new Error(res.message);
      }
      setUseInfoState((prev) => ({
        ...prev,
        user_profile_path: res.data.file_path || "",
      }));
    } catch (error) {
      toggleAlert(error as string);
    }
  };

  const { data } = useQuery<InfoData, Error>({
    queryKey: ["info"],
    queryFn: fetchInfo,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) {
      setUseInfoState(data);
      if (data.user_profile_seq !== null) {
        fetchFile(data.user_profile_seq);
      }
    }
  }, [data]);

  return {
    useInfoState,
    fetchFile,
  };
};
