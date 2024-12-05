import { useState, ChangeEvent } from "react";
import { useMessagePopup } from "@hooks/popup/useMessagePopup";
import styles from "@styles/components/_popup.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";

export default function MessagePopup() {
  const { useMessagePopupState, toggleMessagePopup } = useMessagePopup();
  const [textareaValue, setTextareaValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTextareaValue(value);

    if (typeof value !== "string") {
      setError("문자만 입력할 수 있습니다.");
    } else {
      setError("");
    }
  };

  const handleSave = () => {
    if (textareaValue.trim() === "") {
      return setError("메시지를 입력해 주세요.");
    }
    if (error) return;
    toggleMessagePopup({
      isActOpen: false,
      recipientUid: useMessagePopupState.recipientUid,
      recipientName: useMessagePopupState.recipientName,
      message: textareaValue,
    });
  };

  return (
    <div className={styles.popup}>
      <div
        className={styles.dim}
        onClick={() => {
          toggleMessagePopup({
            ...useMessagePopupState,
            isActOpen: false,
          });
        }}
      />
      <div className={styles.popupWrapper}>
        <h3>
          받는 사람 <strong>{useMessagePopupState.recipientName}</strong>
        </h3>
        <textarea
          name="messsageTextarea"
          id="messsageTextarea"
          cols={30}
          rows={10}
          maxLength={10000}
          value={textareaValue}
          onChange={handleInputChange}
        />
        {error && <p className={styles.error}>{error}</p>}
        <button
          type="button"
          className={`button ${buttonStyles.buttonBlue}`}
          onClick={handleSave}
        >
          보내기
        </button>
      </div>
    </div>
  );
}
