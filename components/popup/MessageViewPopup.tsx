import { useState, ChangeEvent, useEffect } from "react";
import { useMessage } from "@hooks/useMessage";
import { useMessagePopup } from "@hooks/popup/useMessagePopup";
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
  const { message } = useMessage();
  const { toggleMessagePopup } = useMessagePopup();

  const handleMessageDelete = () => {};

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
