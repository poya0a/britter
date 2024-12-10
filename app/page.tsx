"use client";
import { useEffect } from "react";
import styles from "./page.module.scss";
import MainMenu from "@components/menu/MainMenu";
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
import { useSearchPopup } from "@hooks/popup/useSearchPopup";
import { useSettingMenu } from "@hooks/menu/useSettingMenu";
import SearchPopup from "@components/popup/SearchPopup";
import SettingMenu from "@components/menu/SettingMenu";
import CreatePopup from "@components/popup/CreatePopup";
import { useCreatePopup } from "@hooks/popup/useCreatePopup";
import { useSpaceSettingPopup } from "@hooks/popup/useSpaceSettingPopup";
import SpaceSettingPopup from "@components/popup/SpaceSettingPopup";
import { usePostFolderPopup } from "@hooks/popup/usePostFolderPopup";
import PostFolderPopup from "@components/popup/PostFolderPopup";
import { useMessagePopup } from "@hooks/popup/useMessagePopup";
import MessagePopup from "@components/popup/MessagePopup";
import { useUserViewPopup } from "@hooks/popup/useUserViewPopup";
import UserViewPopup from "@components/popup/UserViewPopup";
import { useUserSettingPopup } from "@hooks/popup/useUserSettingPopup";
import UserSettingPopup from "@components/popup/UserSettingPopup";
import { useFnAlert } from "@hooks/popup/useFnAlert";
import FnAlert from "@components/popup/FnAlert";

export default function Home() {
  const { useAlertState } = useAlert();
  const { useRouteAlertState, toggleRouteAlert } = useRouteAlert();
  const { useFnAndCancelAlertState } = useFnAndCancelAlert();
  const { useFnAlertState } = useFnAlert();
  const { useToastState } = useToast();
  const { useSearchState } = useSearchPopup();
  const { useSettingMenuState } = useSettingMenu();
  const { useCreateState } = useCreatePopup();
  const { useSpaceSettingState } = useSpaceSettingPopup();
  const { usePostFolderPopupState } = usePostFolderPopup();
  const { useMessagePopupState } = useMessagePopup();
  const { useUserViewPopupState } = useUserViewPopup();
  const { useUserSettingPopupState } = useUserSettingPopup();
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
        <div />
      </div>
      {useSearchState.isActOpen && <SearchPopup />}
      {useSettingMenuState.isActOpen && <SettingMenu />}
      {useCreateState.isActOpen && <CreatePopup />}
      {useSpaceSettingState.isActOpen && <SpaceSettingPopup />}
      {usePostFolderPopupState.isActOpen && <PostFolderPopup />}
      {useUserViewPopupState.isActOpen && <UserViewPopup />}
      {useUserSettingPopupState.isActOpen && <UserSettingPopup />}
      {useMessagePopupState.isActOpen && <MessagePopup />}
      {useAlertState.isActOpen && <Alert />}
      {useRouteAlertState.isActOpen && <RoutAlert />}
      {useFnAndCancelAlertState.isActOpen && <FnAndCancelAlert />}
      {useFnAlertState.isActOpen && <FnAlert />}
      {useToastState.isActOpen && <Toast />}
    </>
  );
}
