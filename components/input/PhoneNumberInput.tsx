import { useEffect } from "react";
import styles from "@styles/components/_input.module.scss";
import { ErrorMessage } from "@hookform/error-message";
import { useVerifyStore } from "@stores/auth/useVerifyStore";

interface InputProps {
  hpRegister: any;
  verifyRegister: any;
  errors: any;
  getCertificationNumber: Function;
  postCertificationNumber: Function;
}

export default function PhoneNumberInput({
  hpRegister,
  verifyRegister,
  errors,
  getCertificationNumber,
  postCertificationNumber,
}: InputProps) {
  const { useVerifyState, formatTime, startCountdown } = useVerifyStore();

  useEffect(() => {
    // 카운트다운
    startCountdown();
  }, [startCountdown]);

  return (
    <>
      <div className={styles.inputPhoneNumber}>
        <label htmlFor="userHP" className={styles.required}>
          전화번호
        </label>
        <div className={styles.inputPhoneNumberWrapper}>
          <input
            type="text"
            id="userHp"
            className="input"
            placeholder="휴대전화 번호를 입력해 주세요."
            maxLength={11}
            {...hpRegister}
          />
          <button
            type="button"
            className={`button ${styles.buttonPasswordType}`}
            onClick={() => getCertificationNumber()}
          >
            인증 번호 받기
          </button>
        </div>
      </div>
      <ErrorMessage
        errors={errors}
        name="user_hp"
        render={({ message }) => (
          <p className={styles.errorMessage}>{message}</p>
        )}
      />
      <div className={styles.inputPhoneNumber}>
        <label htmlFor="verifyNumber" className={styles.required}>
          인증번호
        </label>
        <div className={styles.inputPhoneNumberWrapper}>
          <input
            type="text"
            id="verifyNumber"
            className="input"
            placeholder="인증 번호를 입력해 주세요."
            maxLength={6}
            {...verifyRegister}
            readOnly={
              typeof useVerifyState.timeLimit === "number" ? false : true
            }
          />
          <p className={styles.timeLimit}>
            {formatTime(useVerifyState.timeLimit)}
          </p>
          <button
            type="button"
            className={`button ${styles.buttonPasswordType}`}
            onClick={() => postCertificationNumber()}
          >
            인증 번호 확인
          </button>
        </div>
        <ErrorMessage
          errors={errors}
          name="verify_number"
          render={({ message }) => (
            <p className={styles.errorMessage}>{message}</p>
          )}
        />
      </div>
    </>
  );
}
