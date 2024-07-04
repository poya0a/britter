import { useAlert } from "@/hooks/popup/useAlert";
import commonStyles from "@styles/components/_common.module.scss";

export default function Alert() {
  const { useAlertState, toggleAlert } = useAlert();
  return (
    <div className={commonStyles.alert}>
      <div className={commonStyles.dim} />
      <div className={commonStyles.alertWrapper}>
        <p className={commonStyles.alertContent}>{useAlertState.content}</p>
        <div className={commonStyles.alertButton}>
          <button
            type="button"
            className={`button ${commonStyles.buttonBlue}`}
            onClick={() => toggleAlert(false)}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
