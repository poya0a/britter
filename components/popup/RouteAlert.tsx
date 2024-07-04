"use client";
import { useRouteAlert } from "@/hooks/popup/useRouteAlert";
import commonStyles from "@styles/components/_common.module.scss";
import { useRouter } from "next/navigation";

export default function RoutAlert() {
  const router = useRouter();
  const { useRouteAlertState, toggleRouteAlert } = useRouteAlert();

  const handleRoute = () => {
    router.push(useRouteAlertState.route);
    toggleRouteAlert({ isActOpen: false, content: "", route: "/" });
  };

  return (
    <div className={commonStyles.alert}>
      <div className={commonStyles.dim} />
      <div className={commonStyles.alertWrapper}>
        <p className={commonStyles.alertContent}>
          {useRouteAlertState.content}
        </p>
        <div className={commonStyles.alertButton}>
          <button
            type="button"
            className={`button ${commonStyles.buttonBlue}`}
            onClick={handleRoute}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
