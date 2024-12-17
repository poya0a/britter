"use client";
import { useEffect } from "react";
import storage from "@fetch/auth/storage";
import { useInfoStore } from "@stores/user/useInfoStore";
import { useSpaceStore } from "@stores/user/useSpaceStore";
import { useMessageStore } from "@stores/user/useMessageStore";
import MainMenu from "@components/menu/MainMenu";
import { usePathname } from "next/navigation";
import SpaceContent from "@components/common/SpaceContent";
import { useRouteAlertStore } from "@stores/popup/useRouteAlertStore";
import styles from "./page.module.scss";

export default function Home() {
  const { fetchInfo } = useInfoStore();
  const { fetchSpace } = useSpaceStore();
  const { fetchMessageList } = useMessageStore();
  const { toggleRouteAlert } = useRouteAlertStore();
  const pathname = usePathname();
  const userToken = storage.getAccessToken();

  useEffect(() => {
    if (userToken) {
      fetchInfo();
      fetchSpace();
      fetchMessageList({ typeName: "receivedMessage", page: 0 });
    }
  }, []);

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
    <div className={styles.home}>
      <MainMenu />
      <SpaceContent />
    </div>
  );
}
