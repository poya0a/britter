import commonStyles from "@styles/components/_common.module.scss";
import { ErrorMessage } from "@hookform/error-message";
import { useVerify } from "@/hooks/useVerify";

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
  const { formatTime, useVerifyState } = useVerify();

  return (
    <>
      <div className={commonStyles.inputPhoneNumber}>
        <label htmlFor="userHP" className={commonStyles.required}>
          전화번호
        </label>
        <div className={commonStyles.inputPhoneNumberWrapper}>
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
            className={`button ${commonStyles.buttonPasswordType}`}
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
          <p className={commonStyles.errorMessage}>{message}</p>
        )}
      />
      <div className={commonStyles.inputPhoneNumber}>
        <label htmlFor="verifyNumber" className={commonStyles.required}>
          인증번호
        </label>
        <div className={commonStyles.inputPhoneNumberWrapper}>
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
          <p className={commonStyles.timeLimit}>
            {formatTime(useVerifyState.timeLimit)}
          </p>
          <button
            type="button"
            className={`button ${commonStyles.buttonPasswordType}`}
            onClick={() => postCertificationNumber()}
          >
            인증 번호 확인
          </button>
        </div>
        <ErrorMessage
          errors={errors}
          name="verify_number"
          render={({ message }) => (
            <p className={commonStyles.errorMessage}>{message}</p>
          )}
        />
      </div>
    </>
  );
}
