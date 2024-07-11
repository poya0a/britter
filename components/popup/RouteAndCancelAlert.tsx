"use client";
import { useRouteAndCancelAlert } from "@/hooks/popup/useRouteAndCancelAlert";
import styles from "@styles/components/_popup.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import { useRouter } from "next/navigation";

export default function RoutAndCancelAlert() {
  const router = useRouter();
  const { useRouteAndCancelAlertState, toggleRouteAndCancelAlert } =
    useRouteAndCancelAlert();

  const handleRoute = () => {
    router.push(useRouteAndCancelAlertState.route);
    toggleRouteAndCancelAlert({ isActOpen: false, content: "", route: "/" });
  };

  return (
    <div className={styles.alert}>
      <div className={styles.dim} />
      <div className={styles.alertWrapper}>
        <p className={styles.alertContent}>
          {useRouteAndCancelAlertState.content}
        </p>
        <div className={styles.alertButton}>
          <button
            type="button"
            className={`button ${buttonStyles.buttonBorderBlue}`}
            onClick={() =>
              toggleRouteAndCancelAlert({
                isActOpen: false,
                content: "",
                route: "/",
              })
            }
          >
            취소
          </button>

          <button
            type="button"
            className={`button ${buttonStyles.buttonBlue}`}
            onClick={handleRoute}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
