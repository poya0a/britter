import { useToast } from "@/hooks/popup/useToast";
import styles from "@styles/components/_popup.module.scss";

export default function Toast() {
  const { useToastState } = useToast();
  return (
    <div className={styles.toast}>
      <p className={styles.toastContent}>{useToastState.content}</p>
    </div>
  );
}
