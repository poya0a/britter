"use client";
import styles from "@styles/components/_common.module.scss";
import HeaderLogo from "./HeaderLogo";
import { usePathname } from "next/navigation";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import storage from "@fetch/auth/storage";
import { useAlertStore } from "@stores/popup/useAlertStore";
import { useRouteAlertStore } from "@stores/popup/useRouteAlertStore";
import { useFnAndCancelAlertStore } from "@stores/popup/useFnAndCancelAlertStore";
import { useFnAlertStore } from "@stores/popup/useFnAlertStore";
import { useSearchPopupStore } from "@stores/popup/useSearchPopupStore";
import { useSettingMenuStore } from "@stores/menu/useSettingMenuStore";
import { useCreatePopupStore } from "@stores/popup/useCreatePopupStore";
import { useSpaceSettingPopupStore } from "@stores/popup/useSpaceSettingPopupStore";
import { useURLPopupStore } from "@stores/popup/useURLPopupStore";
import { usePostFolderPopupStore } from "@stores/popup/usePostFolderPopupStore";
import { useMessagePopupStore } from "@stores/popup/useMessagePopupStore";
import { useUserViewPopupStore } from "@stores/popup/useUserViewPopupStore";
import { useUserSettingPopupStore } from "@stores/popup/useUserSettingPopupStore";

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

  const { toggleAlert } = useAlertStore();
  const { toggleRouteAlert } = useRouteAlertStore();
  const { toggleFnAndCancelAlert } = useFnAndCancelAlertStore();
  const { useFnAlertState, toggleFnAlert } = useFnAlertStore();
  const { toggleSearchPopup } = useSearchPopupStore();
  const { toggleSettingMenu } = useSettingMenuStore();
  const { toggleCreatePopup } = useCreatePopupStore();
  const { toggleSpaceSettingPopup } = useSpaceSettingPopupStore();
  const { toggleURLPopup } = useURLPopupStore();
  const { usePostFolderPopupState, togglePostFolderPopup } =
    usePostFolderPopupStore();
  const { useMessagePopupState, toggleMessagePopup } = useMessagePopupStore();
  const { toggleUserViewPopup } = useUserViewPopupStore();
  const { toggleUserSettingPopup } = useUserSettingPopupStore();

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

    // 닫기
    toggleFnAlert({ ...useFnAlertState, isActOpen: false });
    toggleSearchPopup(false);
    toggleSettingMenu(false);
    toggleCreatePopup(false);
    toggleSpaceSettingPopup(false);
    toggleURLPopup({ URL: null, label: null });
    togglePostFolderPopup({ ...usePostFolderPopupState, isActOpen: false });
    toggleMessagePopup({ ...useMessagePopupState, isActOpen: false });
    toggleUserViewPopup({ isActOpen: false });
    toggleUserSettingPopup(false);

    storage.removeToken();
    toggleRouteAlert({
      isActOpen: true,
      content: res.message,
      route: "/login",
    });
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
