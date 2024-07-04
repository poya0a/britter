"use client";
import styles from "./page.module.scss";
import MainMenu from "@components/common/MainMenu";
import { useRouteAlert } from "@/hooks/popup/useRouteAlert";
import RoutAlert from "@components/popup/RouteAlert";
import FnAndCancelAlert from "@components/popup/FnAndCancelAlert";
import Toast from "@/components/popup/Toast";
import { useToast } from "@/hooks/popup/useToast";
import Alert from "@components/popup/Alert";
import { useAlert } from "@/hooks/popup/useAlert";
import { useFnAndCancelAlert } from "@/hooks/popup/useFnAndCancelAlert";

export default function Home() {
  const { useAlertState } = useAlert();
  const { useRouteAlertState } = useRouteAlert();
  const { useFnAndCancelAlertState } = useFnAndCancelAlert();
  const { useToastState } = useToast();
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
