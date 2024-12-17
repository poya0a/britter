import { useMessageStore } from "@stores/user/useMessageStore";
import { useMessagePopupStore } from "@stores/popup/useMessagePopupStore";
import { useAlertStore } from "@stores/popup/useAlertStore";
import { useFnAndCancelAlertStore } from "@stores/popup/useFnAndCancelAlertStore";
import styles from "@styles/components/_popup.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";

export default function MessageViewPopup({
  type,
  uid,
  handleClose,
}: {
  type: string;
  uid: string;
  handleClose: Function;
}) {
  const { useMessageState, handleDeleteMessage } = useMessageStore();
  const { toggleMessagePopup } = useMessagePopupStore();
  const { toggleAlert } = useAlertStore();
  const { toggleFnAndCancelAlert } = useFnAndCancelAlertStore();

  const handleMessageDelete = () => {
    toggleFnAndCancelAlert({
      isActOpen: true,
      content: "삭제하시겠습니까?",
      fn: () => {
        handleDeleteMessage(uid);
      },
    });
  };

  const handleMessageReceive = () => {
    if (type !== "receivedMessage") {
      return handleClose();
    }

    if (useMessageState && useMessageState.name) {
      // 메시지 보내기
      toggleMessagePopup({
        isActOpen: true,
        recipientUid: uid,
        recipientName: useMessageState.name,
      });
    } else {
      toggleAlert(
        "수신인이 탈퇴했거나 정보를 찾을 수 없어 답장할 수 없습니다."
      );
    }
  };

  return (
    <div className={styles.popup}>
      <div className={styles.dim} onClick={() => handleClose()} />
      <div className={styles.popupWrapper}>
        <h3>
          {type === "receivedMessage" ? "보낸" : "받는"}
          &nbsp;사람{" "}
          <strong>
            {useMessageState && useMessageState.name
              ? useMessageState.name
              : "알 수 없음"}
          </strong>
        </h3>
        <div className={styles.messageView}>
          <p>{useMessageState.message}</p>
        </div>
        <div className={buttonStyles.flexableButtonWrapper}>
          <button
            type="button"
            className={`button ${buttonStyles.buttonBorderBlue}`}
            onClick={handleMessageDelete}
          >
            삭제
          </button>
          <button
            type="button"
            className={`button ${buttonStyles.buttonBlue}`}
            onClick={handleMessageReceive}
          >
            {type === "receivedMessage" ? "답장" : "닫기"}
          </button>
        </div>
      </div>
    </div>
  );
}
