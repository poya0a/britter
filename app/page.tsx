"use client";
import styles from "./page.module.scss";
import MainMenu from "@components/common/MainMenu";
import { useRouteAlert } from "@hooks/useRouteAlert";
import RoutAlert from "@components/popup/RouteAlert";
import Toast from "@/components/popup/Toast";
import { useToast } from "@/hooks/useToast";

export default function Home() {
  const { useRouteAlertState } = useRouteAlert();
  const { useToastState } = useToast();
  return (
    <>
      <div className={styles.home}>
        <MainMenu />
      </div>
      {useRouteAlertState.isActOpen && <RoutAlert />}
      {useToastState.isActOpen && <Toast />}
    </>
  );
}
