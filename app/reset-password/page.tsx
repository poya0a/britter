import commonStyles from "@styles/components/_common.module.scss";
import styles from "./page.module.scss";
import AuthHeader from "@/components/common/AuthHeader";
import PasswordInput from "@/components/input/PasswordInput";

export default function ResetPassword() {
  return (
    <div className={styles.resetPassword}>
      <AuthHeader type={"reset"}></AuthHeader>
      <form action="">
        <div className={styles.resetPasswordWrapper}>
          <PasswordInput
            id="userPw"
            name="비밀번호"
            placeholder="비밀번호를 입력해 주세요."
          />
          <PasswordInput
            id="userPwConfirm"
            name="새 비밀번호"
            placeholder="새 비밀번호를 입력해 주세요."
          />
        </div>

        <div className={commonStyles.buttonFooterWrapper}>
          <button
            type="button"
            className={`button ${commonStyles.buttonFooter}`}
          >
            비밀번호 재설정
          </button>
        </div>
      </form>
    </div>
  );
}
