"use client";
import commonStyles from "@styles/components/_common.module.scss";
import styles from "./page.module.scss";
import AuthHeader from "@components/common/AuthHeader";
import PasswordInput from "@components/input/PasswordInput";
import { useForm } from "react-hook-form";
import { passwordPattern } from "@/utils/regex";
import { ErrorMessage } from "@hookform/error-message";
import { useResetPassword } from "@hooks/useResetPassword";
import { useAlert } from "@hooks/useAlert";
import Alert from "@components/popup/Alert";
import { useRouteAlert } from "@hooks/useRouteAlert";
import RoutAlert from "@components/popup/RouteAlert";
import RoutAndCancelAlert from "@components/popup/RouteAndCancelAlert";
import { useRouteAndCancelAlert } from "@hooks/useRouteAndCancelAlert";

export default function ResetPassword() {
  const {
    register,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const { useAlertState, toggleAlert } = useAlert();
  const { useRouteAlertState, toggleRouteAlert } = useRouteAlert();
  const { useRouteAndCancelAlertState } = useRouteAndCancelAlert();
  const { useUserState } = useResetPassword();

  const handlePwCheck = () => {
    const pw = getValues("user_pw");
    const pwCheck = getValues("user_pw_check");

    if (pw === pwCheck) {
      clearErrors("user_pw_check");
    }
  };

  const onSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (
      typeof window !== "undefined" &&
      document.activeElement instanceof HTMLElement
    ) {
      document.activeElement.blur();
    }
    const pwValue = getValues("user_pw");
    const pwCheckValue = getValues("user_pw_check");

    if (!pwValue || !pwCheckValue || pwValue !== pwCheckValue) {
      if (!pwValue) {
        setError("user_pw", {
          type: "empty",
          message: "비밀번호를 입력해 주세요.",
        });
      }
      if (!pwCheckValue) {
        setError("user_pw_check", {
          type: "empty",
          message: "비밀번호를 한 번 더 입력해 주세요.",
        });
      }
      if (pwValue !== pwCheckValue) {
        setError("user_pw_check", {
          type: "custom",
          message: "비밀번호가 일치하지 않습니다.",
        });
      }
      return;
    } else {
      try {
        const value = {
          user_id: useUserState.user_id,
          user_name: useUserState.user_name,
          user_hp: useUserState.user_hp,
          user_certification: useUserState.user_certification,
          user_pw: pwValue,
          user_pw_check: pwCheckValue,
        };

        const res = await fetch("api/auth/resetPassword", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });

        if (res.ok) {
          const resData = await res.json();
          if (resData.resultCode) {
            toggleRouteAlert({
              isActOpen: true,
              content: resData.message,
              route: "/login",
            });
          } else {
            toggleAlert(resData.message);
          }
        } else {
          toggleAlert("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
        }
      } catch (error) {
        toggleAlert("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
      }
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
            type="submit"
            className={`button ${commonStyles.buttonFooter}`}
            onClick={(e) => onSubmit(e)}
          >
            비밀번호 재설정
          </button>
        </div>
      </form>
      {useAlertState.isActOpen && <Alert />}
      {useRouteAlertState.isActOpen && <RoutAlert />}
      {useRouteAndCancelAlertState.isActOpen && <RoutAndCancelAlert />}
    </div>
  );
}
