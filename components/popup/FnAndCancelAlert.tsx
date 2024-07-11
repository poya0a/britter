"use client";
import { useFnAndCancelAlert } from "@/hooks/popup/useFnAndCancelAlert";
import styles from "@styles/components/_popup.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";

export default function FnAndCancelAlert() {
  const { useFnAndCancelAlertState, toggleFnAndCancelAlert } =
    useFnAndCancelAlert();

  const handleFn = () => {
    useFnAndCancelAlertState.fn();
    toggleFnAndCancelAlert({ isActOpen: false, content: "", fn: () => {} });
  };

  return (
    <div className={styles.alert}>
      <div className={styles.dim} />
      <div className={styles.alertWrapper}>
        <p className={styles.alertContent}>
          {useFnAndCancelAlertState.content}
        </p>
        <div className={styles.alertButton}>
          <button
            type="button"
            className={`button ${buttonStyles.buttonBorderBlue}`}
            onClick={() =>
              toggleFnAndCancelAlert({
                isActOpen: false,
                content: "",
                fn: () => {},
              })
            }
          >
            취소
          </button>
          <button
            type="button"
            className={`button ${buttonStyles.buttonBlue}`}
            onClick={handleFn}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
