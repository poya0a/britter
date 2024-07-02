"use client";
import styles from "./page.module.scss";
import MainMenu from "@components/common/MainMenu";
import { useRouteAlert } from "@hooks/useRouteAlert";
import RoutAlert from "@components/popup/RouteAlert";

export default function Home() {
  const { useRouteAlertState } = useRouteAlert();
  return (
    <>
      <div className={styles.home}>
        <MainMenu />
      </div>
      {useRouteAlertState.isActOpen && <RoutAlert />}
    </>
  );
}
