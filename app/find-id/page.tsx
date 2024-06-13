import commonStyles from "@styles/components/_common.module.scss";
import styles from "./page.module.scss";
import AuthHeader from "@/components/common/AuthHeader";
import PhoneNumberInput from "@/components/input/PhoneNumberInput";

export default function FindId() {
  return (
    <div className={styles.findId}>
      <AuthHeader type={"id"}></AuthHeader>
      <form action="">
        <div className={styles.findIdWrapper}>
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
            아이디 찾기
          </button>
        </div>
      </form>
    </div>
  );
}
