import { useState, KeyboardEvent } from "react";
import { useCreatePopup } from "@hooks/popup/useCreatePopup";
import styles from "@styles/components/_popup.module.scss";
import inputStyles from "@styles/components/_input.module.scss";
import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import { useSpace } from "@hooks/user/useSpace";

export default function CreatePopup() {
  const { toggleCreatePopup } = useCreatePopup();
  const { createSpace } = useSpace();
  const [pressEnter, setPressEnter] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [prevInputValue, setPrevInputValue] = useState<string>("");
  const {
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const handleClose = () => {
    toggleCreatePopup(false);
    setInputValue("");
    clearErrors();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (pressEnter && inputValue === prevInputValue) {
      return;
    }
    if (e.key === "Enter") {
      handleCreate();
    }
  };

  const handleCreate = () => {
    if (inputValue === "") {
      setPrevInputValue(inputValue);
      return setError("value", {
        message: "생성할 스페이스 이름을 입력해 주세요.",
      });
    }

    setPressEnter(true);
    setPrevInputValue(inputValue);
    createSpace(inputValue);
  };

  return (
    <div className={styles.popup}>
      <div className={styles.dim} onClick={handleClose} />
      <div className={styles.popupWrapper}>
        <div className={styles.boderWrapper}>
          <div className={inputStyles.inputText}>
            <label>스페이스 생성</label>
            <div className={inputStyles.inputCheckWrapper}>
              <input
                type="text"
                className="input"
                maxLength={100}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  clearErrors();
                }}
                onKeyDown={handleKeyDown}
              />
              <button type="button" className="button" onClick={handleCreate}>
                생&nbsp;성
              </button>
            </div>
          </div>
          <ErrorMessage
            errors={errors}
            name="value"
            render={({ message }) => (
              <p className={inputStyles.errorMessage}>{message}</p>
            )}
          />
        </div>
      </div>
    </div>
  );
}
