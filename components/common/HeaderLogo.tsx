import { usePost } from "@hooks/user/usePost";
import styles from "@styles/components/_common.module.scss";
import { useRouter } from "next/navigation";
import { useAlert } from "@hooks/popup/useAlert";
import { useFnAndCancelAlert } from "@hooks/popup/useFnAndCancelAlert";
import { useRouteAlert } from "@hooks/popup/useRouteAlert";
import { useRouteAndCancelAlert } from "@hooks/popup/useRouteAndCancelAlert";
import { useSearchPopup } from "@hooks/popup/useSearchPopup";
import { useCreatePopup } from "@hooks/popup/useCreatePopup";
import { useSpaceSettingPopup } from "@hooks/popup/useSpaceSettingPopup";

export default function HeaderLogo() {
  const route = useRouter();
  const { setPageSeq } = usePost();

  const goToHome = () => {
    route.push("/");
    setPageSeq({ seq: "", pSeq: "" });
  };

  const { useAlertState } = useAlert();
  const { useRouteAlertState } = useRouteAlert();
  const { useRouteAndCancelAlertState } = useRouteAndCancelAlert();
  const { useFnAndCancelAlertState } = useFnAndCancelAlert();
  const { useSearchState } = useSearchPopup();
  const { useCreateState } = useCreatePopup();
  const { useSpaceSettingState } = useSpaceSettingPopup();

  return (
    <button
      className={`button ${styles.headerLogo}`}
      onClick={goToHome}
      disabled={
        useAlertState.isActOpen ||
        useRouteAlertState.isActOpen ||
        useRouteAndCancelAlertState.isActOpen ||
        useFnAndCancelAlertState.isActOpen ||
        useSearchState.isActOpen ||
        useCreateState.isActOpen ||
        useSpaceSettingState.isActOpen
          ? true
          : false
      }
    >
      <i className="normal">BRITTER</i>
    </button>
  );
}
