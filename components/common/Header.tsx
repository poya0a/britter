import styles from "@styles/components/_common.module.scss";
import HeaderLogo from "./HeaderLogo";

export default function Header() {
  return (
    <header className={styles.header}>
      <HeaderLogo />
      <button className={`button ${styles.profileButton}`}>
        <img src="/images/profile.svg" alt="profile" />
      </button>
    </header>
  );
}
