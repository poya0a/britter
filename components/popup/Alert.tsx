import { useAlert } from "@/hooks/popup/useAlert";
import styles from "@styles/components/_popup.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";

export default function Alert() {
  const { useAlertState, toggleAlert } = useAlert();
  return (
    <div className={styles.alert}>
      <div className={styles.dim} />
      <div className={styles.alertWrapper}>
        <p className={styles.alertContent}>{useAlertState.content}</p>
        <div className={styles.alertButton}>
          <button
            type="button"
            className={`button ${buttonStyles.buttonBlue}`}
            onClick={() => toggleAlert(false)}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
