"use client";
import Alert from "@components/popup/Alert";
import { useAlert } from "@hooks/popup/useAlert";
import RoutAlert from "@components/popup/RouteAlert";
import { useRouteAlert } from "@hooks/popup/useRouteAlert";
import FnAndCancelAlert from "@components/popup/FnAndCancelAlert";
import { useFnAndCancelAlert } from "@hooks/popup/useFnAndCancelAlert";
import FnAlert from "@components/popup/FnAlert";
import { useFnAlert } from "@hooks/popup/useFnAlert";
import Toast from "@components/popup/Toast";
import { useToast } from "@hooks/popup/useToast";
import SearchPopup from "@components/popup/SearchPopup";
import { useSearchPopup } from "@hooks/popup/useSearchPopup";
import SettingMenu from "@components/menu/SettingMenu";
import { useSettingMenu } from "@hooks/menu/useSettingMenu";
import CreatePopup from "@components/popup/CreatePopup";
import { useCreatePopup } from "@hooks/popup/useCreatePopup";
import SpaceSettingPopup from "@components/popup/SpaceSettingPopup";
import { useSpaceSettingPopup } from "@hooks/popup/useSpaceSettingPopup";
import URLPopup from "@components/popup/URLPopup";
import { useURLPopup } from "@hooks/popup/useURLPopup";
import PostFolderPopup from "@components/popup/PostFolderPopup";
import { usePostFolderPopup } from "@hooks/popup/usePostFolderPopup";
import MessagePopup from "@components/popup/MessagePopup";
import { useMessagePopup } from "@hooks/popup/useMessagePopup";
import UserViewPopup from "@components/popup/UserViewPopup";
import { useUserViewPopup } from "@hooks/popup/useUserViewPopup";
import UserSettingPopup from "@components/popup/UserSettingPopup";
import { useUserSettingPopup } from "@hooks/popup/useUserSettingPopup";

export default function Popup() {
  const { useAlertState } = useAlert();
  const { useRouteAlertState } = useRouteAlert();
  const { useFnAndCancelAlertState } = useFnAndCancelAlert();
  const { useFnAlertState } = useFnAlert();
  const { useToastState } = useToast();
  const { useSearchState } = useSearchPopup();
  const { useSettingMenuState } = useSettingMenu();
  const { useCreateState } = useCreatePopup();
  const { useSpaceSettingState } = useSpaceSettingPopup();
  const { useURLPopupState } = useURLPopup();
  const { usePostFolderPopupState } = usePostFolderPopup();
  const { useMessagePopupState } = useMessagePopup();
  const { useUserViewPopupState } = useUserViewPopup();
  const { useUserSettingPopupState } = useUserSettingPopup();

  return (
    <div>
      {useSearchState.isActOpen && <SearchPopup />}
      {useSettingMenuState.isActOpen && <SettingMenu />}
      {useCreateState.isActOpen && <CreatePopup />}
      {useSpaceSettingState.isActOpen && <SpaceSettingPopup />}
      {useURLPopupState.isActOpen && <URLPopup />}
      {usePostFolderPopupState.isActOpen && <PostFolderPopup />}
      {useUserViewPopupState.isActOpen && <UserViewPopup />}
      {useUserSettingPopupState.isActOpen && <UserSettingPopup />}
      {useMessagePopupState.isActOpen && <MessagePopup />}
      {useAlertState.isActOpen && <Alert />}
      {useRouteAlertState.isActOpen && <RoutAlert />}
      {useFnAndCancelAlertState.isActOpen && <FnAndCancelAlert />}
      {useFnAlertState.isActOpen && <FnAlert />}
      {useToastState.isActOpen && <Toast />}
    </div>
  );
}
