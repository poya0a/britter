"use client";
import styles from "@styles/components/_button.module.scss";

interface NavigateProps {
  fn: () => void;
}

export default function Navigate({ fn }: NavigateProps) {
  return (
    <button type="button" className={`button ${styles.navigate}`} onClick={fn}>
      <img src="/images/icon/back.svg" alt="goToBack" />
    </button>
  );
}
