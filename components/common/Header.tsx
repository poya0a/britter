"use client";
import styles from "@styles/components/_common.module.scss";
import HeaderLogo from "./HeaderLogo";
import { usePathname } from "next/navigation";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import { useFnAndCancelAlert } from "@hooks/popup/useFnAndCancelAlert";
import { useAlert } from "@hooks/popup/useAlert";
import { useRouteAlert } from "@hooks/popup/useRouteAlert";
import storage from "@fetch/auth/storage";

export default function Header() {
  const pathname = usePathname();
  const pathWithoutLogout = [
    "/login",
    "/join",
    "/find-id",
    "/find-password",
    "/reset-password",
    "/complete",
  ];

  const { toggleFnAndCancelAlert } = useFnAndCancelAlert();
  const { toggleAlert } = useAlert();
  const { toggleRouteAlert } = useRouteAlert();

  const handleLogout = () => {
    toggleFnAndCancelAlert({
      isActOpen: true,
      content: "로그아웃하시겠습니까?",
      fn: logout,
    });
  };

  const logout = async () => {
    const res = await fetchApi({
      method: "GET",
      url: requests.LOGOUT,
    });
    if (!res.resultCode) {
      toggleAlert(res.message);
    } else {
      storage.removeToken();
      toggleRouteAlert({
        isActOpen: true,
        content: res.message,
        route: "/login",
      });
    }
  };

  return (
    <header className={styles.header}>
      <HeaderLogo />
      {!pathWithoutLogout.includes(pathname || "") && (
        <button
          className={`button ${styles.logoutButton}`}
          onClick={handleLogout}
        >
          <img src="/images/icon/logout.svg" alt="logout" />
        </button>
      )}
    </header>
  );
}
