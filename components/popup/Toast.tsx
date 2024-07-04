import { useToast } from "@/hooks/useToast";
import commonStyles from "@styles/components/_common.module.scss";

export default function Toast() {
  const { useToastState } = useToast();
  return (
    <div className={commonStyles.toast}>
      <p className={commonStyles.toastContent}>{useToastState.content}</p>
    </div>
  );
}
