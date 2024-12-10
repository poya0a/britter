"use client";
import { useFnAlert } from "@hooks/popup/useFnAlert";
import styles from "@styles/components/_popup.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";

export default function FnAlert() {
  const { useFnAlertState, toggleFnAlert } = useFnAlert();

  const handleFn = () => {
    useFnAlertState.fn();
    toggleFnAlert({ isActOpen: false, content: "", fn: () => {} });
  };

  return (
    <div className={styles.alert}>
      <div className={styles.dim} />
      <div className={styles.alertWrapper}>
        <p className={styles.alertContent}>{useFnAlertState.content}</p>
        <div className={styles.alertButton}>
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
