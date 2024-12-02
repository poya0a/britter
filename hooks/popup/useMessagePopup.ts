import { FetchError } from "@fetch/types";
import fetchApi from "@fetch/fetch";
import storage from "@fetch/auth/storage";
import requests from "@fetch/requests";
import { useRecoilState } from "recoil";
import { atom } from "recoil";
import { useAlert } from "./useAlert";
import { useToast } from "./useToast";

interface MessagePopupData {
  isActOpen: boolean;
  recipientUid: string;
  recipientName: string;
  message?: string;
}

export const messagePopupState = atom<MessagePopupData>({
  key: "messagePopupState",
  default: {
    isActOpen: false,
    recipientUid: "",
    recipientName: "",
  },
});

export const useMessagePopup = () => {
  const [useMessagePopupState, setUseMessagePopupState] =
    useRecoilState<MessagePopupData>(messagePopupState);
  const { toggleAlert } = useAlert();
  const { setToast } = useToast();

  const toggleMessagePopup = async (props: MessagePopupData) => {
    if (props.isActOpen) {
      setUseMessagePopupState(props);
    } else {
      if (props.message) {
        const formData = new FormData();

        formData.append("recipientUid", props.recipientUid);
        formData.append("message", props.message);
        const send = await sendMessage(formData);

        if (send) {
          setUseMessagePopupState(props);
        }
      }
    }
  };

  const sendMessage = async (formData: FormData): Promise<boolean> => {
    const res = await fetchApi({
      method: "POST",
      url: requests.POST_MESSAGE,
      body: formData,
    });

    if (res.message) {
      if (res.resultCode) {
        setToast(res.message);
        return true;
      } else {
        toggleAlert(res.message);
      }
    } else {
      toggleAlert("메시지 전송에 실패하였습니다.");
    }

    return false;
  };

  return {
    useMessagePopupState,
    toggleMessagePopup,
  };
};
