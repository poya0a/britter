import { useMessage } from "@hooks/user/useMessage";
import { useMessagePopup } from "@hooks/popup/useMessagePopup";
import { useFnAndCancelAlert } from "@hooks/popup/useFnAndCancelAlert";
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
  const { message, handleDeleteMessage } = useMessage();
  const { toggleMessagePopup } = useMessagePopup();
  const { toggleFnAndCancelAlert } = useFnAndCancelAlert();

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
    // 메시지 보내기
    toggleMessagePopup({
      isActOpen: true,
      recipientUid: uid,
      recipientName: message?.name || "",
    });
  };

  return (
    <div className={styles.popup}>
      <div className={styles.dim} onClick={() => handleClose()} />
      <div className={styles.popupWrapper}>
        <h3>
          {type === "receivedMessage" ? "보낸" : "받는"}
          &nbsp;사람 <strong>{message?.name || ""}</strong>
        </h3>
        <div className={styles.messageView}>
          <p>{message?.message}</p>
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
