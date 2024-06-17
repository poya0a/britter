"use client";
import commonStyles from "@styles/components/_common.module.scss";
import styles from "./page.module.scss";
import Logo from "@/components/common/Logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/input/PasswordInput";

export default function Login() {
  const router = useRouter();

  return (
    <div className={styles.login}>
      <Logo />
      <form action="">
        <div className={styles.loginWrapper}>
          <div className={commonStyles.inputText}>
            <label htmlFor="userId">아이디</label>
            <input
              type="text"
              id="userId"
              className="input"
              placeholder="아이디를 입력해 주세요."
              autoComplete="userId"
            />
          </div>
          <PasswordInput
            id="userPw"
            name="비밀번호"
            placeholder="비밀번호를 입력해 주세요."
          />
        </div>
        <button
          type="button"
          className={`button ${commonStyles.buttonBlue}`}
          onClick={() => router.push("/poya505")}
        >
          로그인
        </button>
      </form>
      <div className={commonStyles.textLine}>
        <em className="normal">간편 로그인</em>
      </div>

      <div className={styles.social}>
        <button
          type="button"
          className={`button ${commonStyles.buttonCircleLine}`}
        >
          <img src="images/icon/kakao.png" alt="kakao" />
        </button>
        <button
          type="button"
          className={`button ${commonStyles.buttonCircleLine}`}
        >
          <img src="images/icon/naver.png" alt="naver" />
        </button>
        <button
          type="button"
          className={`button ${commonStyles.buttonCircleLine}`}
        >
          <img src="images/icon/apple.png" alt="apple" />
        </button>
      </div>

      <p className={styles.goToJoin}>
        아직 계정이 없으신가요? <Link href={"/join"}>회원가입</Link>
      </p>

      <div className={`button ${commonStyles.buttonJustText}`}>
        <Link href={"/find-id"} className="button">
          아이디 찾기
        </Link>
        <Link href={"/find-password"} className="button">
          비밀번호 찾기
        </Link>
      </div>
    </div>
  );
}
