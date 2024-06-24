"use client";
import { useRouteAndCancelAlert } from "@hooks/useRouteAndCancelAlert";
import commonStyles from "@styles/components/_common.module.scss";
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
    <div className={commonStyles.alert}>
      <div className={commonStyles.dim} />
      <div className={commonStyles.alertWrapper}>
        <p className={commonStyles.alertContent}>
          {useRouteAndCancelAlertState.content}
        </p>
        <div className={commonStyles.alertButton}>
          <button
            type="button"
            className={`button ${commonStyles.buttonBorderBlue}`}
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
