"use client";
import { useEffect } from "react";
import styles from "./page.module.scss";
import MainMenu from "@components/common/MainMenu";
import { useRouteAlert } from "@hooks/popup/useRouteAlert";
import RoutAlert from "@components/popup/RouteAlert";
import FnAndCancelAlert from "@components/popup/FnAndCancelAlert";
import Toast from "@components/popup/Toast";
import { useToast } from "@hooks/popup/useToast";
import Alert from "@components/popup/Alert";
import { useAlert } from "@hooks/popup/useAlert";
import { useFnAndCancelAlert } from "@hooks/popup/useFnAndCancelAlert";
import { usePathname } from "next/navigation";
import storage from "@fetch/auth/storage";

export default function Home() {
  const { useAlertState } = useAlert();
  const { useRouteAlertState, toggleRouteAlert } = useRouteAlert();
  const { useFnAndCancelAlertState } = useFnAndCancelAlert();
  const { useToastState } = useToast();
  const pathname = usePathname();
  const userToken = storage.getAccessToken();

  useEffect(() => {
    if (!userToken) {
      toggleRouteAlert({
        isActOpen: true,
        content: "로그인 후 이용 가능한 페이지입니다.",
        route: "/login",
      });
    }
  }, [pathname]);

  return (
    <>
      <div className={styles.home}>
        <MainMenu />
      </div>
      {useAlertState.isActOpen && <Alert />}
      {useRouteAlertState.isActOpen && <RoutAlert />}
      {useFnAndCancelAlertState.isActOpen && <FnAndCancelAlert />}
      {useToastState.isActOpen && <Toast />}
    </>
  );
}
