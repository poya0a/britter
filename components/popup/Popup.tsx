"use client";
import Alert from "@components/popup/Alert";
import { useAlertStore } from "@stores/popup/useAlertStore";
import RoutAlert from "@components/popup/RouteAlert";
import { useRouteAlertStore } from "@stores/popup/useRouteAlertStore";
import FnAlert from "@components/popup/FnAlert";
import { useFnAlertStore } from "@stores/popup/useFnAlertStore";
import FnAndCancelAlert from "@components/popup/FnAndCancelAlert";
import { useFnAndCancelAlertStore } from "@stores/popup/useFnAndCancelAlertStore";
import Toast from "@components/popup/Toast";
import { useToastStore } from "@stores/popup/useToastStore";
import SearchPopup from "@components/popup/SearchPopup";
import { useSearchPopupStore } from "@stores/popup/useSearchPopupStore";
import SettingMenu from "@components/menu/SettingMenu";
import { useSettingMenuStore } from "@stores/menu/useSettingMenuStore";
import CreatePopup from "@components/popup/CreatePopup";
import { useCreatePopupStore } from "@stores/popup/useCreatePopupStore";
import SpaceSettingPopup from "@components/popup/SpaceSettingPopup";
import { useSpaceSettingPopupStore } from "@stores/popup/useSpaceSettingPopupStore";
import URLPopup from "@components/popup/URLPopup";
import { useURLPopupStore } from "@stores/popup/useURLPopupStore";
import PostFolderPopup from "@components/popup/PostFolderPopup";
import { usePostFolderPopupStore } from "@stores/popup/usePostFolderPopupStore";
import MessagePopup from "@components/popup/MessagePopup";
import { useMessagePopupStore } from "@stores/popup/useMessagePopupStore";
import UserViewPopup from "@components/popup/UserViewPopup";
import { useUserViewPopupStore } from "@stores/popup/useUserViewPopupStore";
import UserSettingPopup from "@components/popup/UserSettingPopup";
import { useUserSettingPopupStore } from "@stores/popup/useUserSettingPopupStore";

export default function Popup() {
  const { useAlertState } = useAlertStore();
  const { useRouteAlertState } = useRouteAlertStore();
  const { useFnAlertState } = useFnAlertStore();
  const { useFnAndCancelAlertState } = useFnAndCancelAlertStore();
  const { useToastState } = useToastStore();
  const { useSearchState } = useSearchPopupStore();
  const { useSettingMenuState } = useSettingMenuStore();
  const { useCreatePopupState } = useCreatePopupStore();
  const { useSpaceSettingState } = useSpaceSettingPopupStore();
  const { useURLPopupState } = useURLPopupStore();
  const { usePostFolderPopupState } = usePostFolderPopupStore();
  const { useMessagePopupState } = useMessagePopupStore();
  const { useUserViewPopupState } = useUserViewPopupStore();
  const { useUserSettingPopupState } = useUserSettingPopupStore();

  return (
    <div>
      {useSearchState.isActOpen && <SearchPopup />}
      {useSettingMenuState.isActOpen && <SettingMenu />}
      {useCreatePopupState.isActOpen && <CreatePopup />}
      {useSpaceSettingState.isActOpen && <SpaceSettingPopup />}
      {useURLPopupState.isActOpen && <URLPopup />}
      {usePostFolderPopupState.isActOpen && <PostFolderPopup />}
      {useUserViewPopupState.isActOpen && <UserViewPopup />}
      {useUserSettingPopupState && <UserSettingPopup />}
      {useMessagePopupState.isActOpen && <MessagePopup />}
      {useAlertState.isActOpen && <Alert />}
      {useRouteAlertState.isActOpen && <RoutAlert />}
      {useFnAndCancelAlertState.isActOpen && <FnAndCancelAlert />}
      {useFnAlertState.isActOpen && <FnAlert />}
      {useToastState.isActOpen && <Toast />}
    </div>
  );
}
