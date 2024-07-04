"use client";
import { useFnAndCancelAlert } from "@/hooks/popup/useFnAndCancelAlert";
import commonStyles from "@styles/components/_common.module.scss";

export default function FnAndCancelAlert() {
  const { useFnAndCancelAlertState, toggleFnAndCancelAlert } =
    useFnAndCancelAlert();

  const handleFn = () => {
    useFnAndCancelAlertState.fn();
    toggleFnAndCancelAlert({ isActOpen: false, content: "", fn: () => {} });
  };

  return (
    <div className={commonStyles.alert}>
      <div className={commonStyles.dim} />
      <div className={commonStyles.alertWrapper}>
        <p className={commonStyles.alertContent}>
          {useFnAndCancelAlertState.content}
        </p>
        <div className={commonStyles.alertButton}>
          <button
            type="button"
            className={`button ${commonStyles.buttonBorderBlue}`}
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
            className={`button ${commonStyles.buttonBlue}`}
            onClick={handleFn}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
