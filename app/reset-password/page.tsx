"use client";
import commonStyles from "@styles/components/_common.module.scss";
import styles from "./page.module.scss";
import AuthHeader from "@/components/common/AuthHeader";
import PasswordInput from "@/components/input/PasswordInput";
import { useForm } from "react-hook-form";
import { passwordPattern } from "@/utils/regex";
import { ErrorMessage } from "@hookform/error-message";

export default function ResetPassword() {
  const {
    register,
    getValues,
    watch,
    setValue,
    setError,
    clearErrors,
    reset,
    trigger,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const handlePwCheck = () => {
    const pw = getValues("user_pw");
    const pwCheck = getValues("user_pw_check");

    if (pw === pwCheck) {
      clearErrors("user_pw_check");
    }
  };

  return (
    <div className={styles.resetPassword}>
      <AuthHeader type={"reset"}></AuthHeader>
      <form action="">
        <div className={styles.resetPasswordWrapper}>
          <PasswordInput
            id="userPw"
            name="비밀번호"
            placeholder="비밀번호를 입력해 주세요."
            onKeyUp={handlePwCheck}
            register={{
              ...register("user_pw", {
                required: true,
                pattern: {
                  value: passwordPattern,
                  message:
                    "영문, 숫자 포함 8자리 이상 50자 이하 입력해 주세요.",
                },
              }),
            }}
          />
          <ErrorMessage
            errors={errors}
            name="user_pw"
            render={({ message }) => (
              <p className={commonStyles.errorMessage}>{message}</p>
            )}
          />
          <PasswordInput
            id="userPwConfirm"
            name="비밀번호 확인"
            placeholder="비밀번호를 한 번 더 입력해 주세요."
            register={{
              ...register("user_pw_check", {
                required: true,
                pattern: {
                  value: passwordPattern,
                  message:
                    "영문, 숫자 포함 8자리 이상 50자 이하 입력해 주세요.",
                },
                validate: (value) => {
                  const passwordValue = getValues("user_pw");
                  if (value === passwordValue) {
                    return true;
                  } else {
                    return "비밀번호가 일치하지 않습니다.";
                  }
                },
              }),
            }}
          />
          <ErrorMessage
            errors={errors}
            name="user_pw_check"
            render={({ message }) => (
              <p className={commonStyles.errorMessage}>{message}</p>
            )}
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
