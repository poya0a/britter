"use client";
import { useRouteAlert } from "@/hooks/popup/useRouteAlert";
import styles from "@styles/components/_popup.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import { useRouter } from "next/navigation";

export default function RoutAlert() {
  const router = useRouter();
  const { useRouteAlertState, toggleRouteAlert } = useRouteAlert();

  const handleRoute = () => {
    router.push(useRouteAlertState.route);
    toggleRouteAlert({ isActOpen: false, content: "", route: "/" });
  };

  return (
    <div className={styles.alert}>
      <div className={styles.dim} />
      <div className={styles.alertWrapper}>
        <p className={styles.alertContent}>{useRouteAlertState.content}</p>
        <div className={styles.alertButton}>
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
