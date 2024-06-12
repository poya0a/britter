import type { Metadata } from "next";
import styles from "./page.module.scss";
import MainMenu from "@components/common/MainMenu";

export const metadata: Metadata = {
  title: "Home",
};

export default function Home() {
  return (
    <div className={styles.home}>
      <MainMenu />
    </div>
  );
}
