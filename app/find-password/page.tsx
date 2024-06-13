import commonStyles from "@styles/components/_common.module.scss";
import styles from "./page.module.scss";
import AuthHeader from "@/components/common/AuthHeader";
import PhoneNumberInput from "@/components/input/PhoneNumberInput";

export default function FindPassword() {
  return (
    <div className={styles.findPassword}>
      <AuthHeader type={"pw"}></AuthHeader>
      <form action="">
        <div className={styles.findPasswordWrapper}>
          <div className={commonStyles.inputText}>
            <label htmlFor="userId" className={commonStyles.required}>
              아이디
            </label>
            <input
              type="text"
              id="userId"
              className="input"
              placeholder="아이디를 입력해 주세요."
            />
          </div>
          <div className={commonStyles.inputText}>
            <label htmlFor="userName" className={commonStyles.required}>
              이름
            </label>
            <input
              type="text"
              id="userName"
              className="input"
              placeholder="이름을 입력해 주세요."
            />
          </div>
          <PhoneNumberInput />
        </div>

        <div className={commonStyles.buttonFooterWrapper}>
          <button
            type="button"
            className={`button ${commonStyles.buttonFooter}`}
          >
            비밀번호 찾기
          </button>
        </div>
      </form>
    </div>
  );
}
