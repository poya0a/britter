import { useToastStore } from "@stores/popup/useToastStore";
import styles from "@styles/components/_popup.module.scss";

export default function Toast() {
  const { useToastState } = useToastStore();
  return (
    <div className={styles.toast}>
      <p className={styles.toastContent}>{useToastState.content}</p>
    </div>
  );
}
