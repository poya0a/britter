"use client";
import styles from "./page.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import { useSearchParams, useRouter } from "next/navigation";

export default function Complete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams?.get("user_id");

  return (
    <main className={styles.complete}>
      <div className={styles.completeWrapper}>
        <p className={styles.completeMessage}>
          <span>가입 완료!</span>
          {userId} 님, 환영합니다.
        </p>
      </div>
      <div className={buttonStyles.buttonFooterWrapper}>
        <button
          type="button"
          className={`button ${buttonStyles.buttonFooter}`}
          onClick={() => router.push("/login")}
        >
          로그인
        </button>
      </div>
    </main>
  );
}
