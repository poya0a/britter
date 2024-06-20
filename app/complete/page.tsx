"use client";
import styles from "./page.module.scss";
import commonStyles from "@styles/components/_common.module.scss";
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
      <div className={commonStyles.buttonFooterWrapper}>
        <button
          type="button"
          className={`button ${commonStyles.buttonFooter}`}
          onClick={() => router.push("/login")}
        >
          로그인
        </button>
      </div>
    </main>
  );
}
