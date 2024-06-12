import type { Metadata } from "next";
import styles from "./page.module.scss";
import MainMenu from "./MainMenu";

export const metadata: Metadata = {
  title: "Home",
};

export default function Company() {
  return (
    <div className={styles.home}>
      <MainMenu />
    </div>
  );
}
