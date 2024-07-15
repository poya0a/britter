import { useSearchPopup } from "@hooks/popup/useSearchPopup";
import styles from "@styles/components/_popup.module.scss";

export default function SearchPopup() {
  const { useSearchState, toggleSearchPopup, toggleTap } = useSearchPopup();

  return (
    <div className={styles.popup}>
      <div className={styles.dim} />
      <div className={styles.popupWrapper}></div>
    </div>
  );
}
