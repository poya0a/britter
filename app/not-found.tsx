"use client";
import { Metadata } from "next";
import styles from "./page.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import { useRouter } from "next/navigation";

export const metadata: Metadata = {
  title: "Not Found",
};

export default function NotFound() {
  const router = useRouter();
  return (
    <div className={styles.notFound}>
      <h1>페이지를 찾을 수 없습니다.</h1>
      <div className={styles.goToHome}>
        <button
          type="button"
          className={`button ${buttonStyles.buttonBlue}`}
          onClick={() => router.push("/")}
        >
          홈으로
        </button>
      </div>
    </div>
  );
}
