"use client";
import styles from "@styles/components/_common.module.scss";
import HeaderLogo from "./HeaderLogo";
import { usePathname } from "next/navigation";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import storage from "@fetch/auth/storage";
import { useQueryClient } from "@tanstack/react-query";
import { useAlert } from "@hooks/popup/useAlert";
import { useRouteAlert } from "@hooks/popup/useRouteAlert";
import { useRouteAndCancelAlert } from "@hooks/popup/useRouteAndCancelAlert";
import { useFnAndCancelAlert } from "@hooks/popup/useFnAndCancelAlert";
import { useSearchPopup } from "@hooks/popup/useSearchPopup";
import { useCreatePopup } from "@hooks/popup/useCreatePopup";

export default function Header() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const pathWithoutLogout = [
    "/login",
    "/join",
    "/find-id",
    "/find-password",
    "/reset-password",
    "/complete",
  ];

  const { useAlertState, toggleAlert } = useAlert();
  const { useRouteAlertState, toggleRouteAlert } = useRouteAlert();
  const { useRouteAndCancelAlertState } = useRouteAndCancelAlert();
  const { useFnAndCancelAlertState, toggleFnAndCancelAlert } =
    useFnAndCancelAlert();
  const { useSearchState } = useSearchPopup();
  const { useCreateState } = useCreatePopup();

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
    }
    storage.removeToken();
    toggleRouteAlert({
      isActOpen: true,
      content: res.message,
      route: "/login",
    });
    queryClient.clear();
  };

  return (
    <header className={styles.header}>
      <HeaderLogo />
      {!pathWithoutLogout.includes(pathname || "") && (
        <button
          className={`button ${styles.logoutButton}`}
          onClick={handleLogout}
          disabled={
            useAlertState.isActOpen ||
            useRouteAlertState.isActOpen ||
            useRouteAndCancelAlertState.isActOpen ||
            useFnAndCancelAlertState.isActOpen ||
            useSearchState.isActOpen ||
            useCreateState.isActOpen
              ? true
              : false
          }
        >
          <img src="/images/icon/logout.svg" alt="logout" />
        </button>
      )}
    </header>
  );
}
