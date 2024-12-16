"use client";
import { useEffect } from "react";
import storage from "@fetch/auth/storage";
import MainMenu from "@components/menu/MainMenu";
import { usePathname } from "next/navigation";
import SpaceContent from "@components/common/SpaceContent";
import { useRouteAlert } from "@hooks/popup/useRouteAlert";
import styles from "./page.module.scss";

export default function Home() {
  const { toggleRouteAlert } = useRouteAlert();
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
        <SpaceContent />
      </div>
    </>
  );
}
