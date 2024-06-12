import commonStyles from "@styles/components/_common.module.scss";
import styles from "./page.module.scss";
import Logo from "@/components/common/Logo";
import Link from "next/link";

export default function Login() {
  return (
    <div className={styles.login}>
      <Logo />
      <form action="">
        <div className={styles.loginWrapper}>
          <div className={commonStyles.inputText}>
            <label htmlFor="userId">아이디</label>
            <input type="text" id="userId" className="input" />
          </div>
          <div className={commonStyles.inputText}>
            <label htmlFor="userPw">비밀번호</label>
            <input type="text" id="userPw" className="input" />
          </div>
        </div>
        <button type="button" className={`button ${commonStyles.buttonBlue}`}>
          로그인
        </button>

        <div className={commonStyles.textLine}>
          <em className="normal">간편 로그인</em>
        </div>

        <div className={styles.social}>
          <button className={`button ${commonStyles.buttonCircleLine}`}>
            <img src="images/icon/kakao.png" alt="" />
          </button>
          <button className={`button ${commonStyles.buttonCircleLine}`}>
            <img src="images/icon/naver.png" alt="" />
          </button>
          <button className={`button ${commonStyles.buttonCircleLine}`}>
            <img src="images/icon/apple.png" alt="" />
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
      </form>
    </div>
  );
}
