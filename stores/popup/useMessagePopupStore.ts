import { create } from "zustand";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import { useAlertStore } from "./useAlertStore";
import { useToastStore } from "./useToastStore";

interface MessagePopupData {
  isActOpen: boolean;
  recipientUid: string;
  recipientName: string;
  message?: string;
}

interface MessagePopupState {
  useMessagePopupState: MessagePopupData;
  toggleMessagePopup: (props: MessagePopupData) => Promise<void>;
}

export const useMessagePopupStore = create<MessagePopupState>((set, get) => {
  const { toggleAlert } = useAlertStore.getState();
  const { setToast } = useToastStore.getState();

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
    useMessagePopupState: {
      isActOpen: false,
      recipientUid: "",
      recipientName: "",
    },

    toggleMessagePopup: async (props: MessagePopupData) => {
      if (props.isActOpen) {
        set({ useMessagePopupState: props });
      } else {
        if (props.message) {
          const formData = new FormData();
          formData.append("recipientUid", props.recipientUid);
          formData.append("message", props.message);

          const send = await sendMessage(formData);
          if (send) {
            set({ useMessagePopupState: props });
          }
        } else {
          set({ useMessagePopupState: props });
        }
      }
    },
  };
});
