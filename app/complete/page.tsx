"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import { useRouter } from "next/navigation";

export default function Complete() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    setUserId(storedUserId);
  }, []);

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
          onClick={() => {
            router.push("/login");
            localStorage.removeItem("user_id");
          }}
        >
          로그인
        </button>
      </div>
    </main>
  );
}


