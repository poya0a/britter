"use client";
import { useEffect } from "react";
import commonStyles from "@styles/components/_common.module.scss";
import styles from "./page.module.scss";
import AuthHeader from "@components/common/AuthHeader";
import PhoneNumberInput from "@components/input/PhoneNumberInput";
import { useVerify } from "@hooks/useVerify";
import { useForm } from "react-hook-form";
import { getErrorMassage, getValidMassage } from "@utils/errorMessage";
import { onlyNumPattern, phonePattern, regexValue } from "@utils/regex";
import { useAlert } from "@hooks/useAlert";
import Alert from "@components/popup/Alert";
import { ErrorMessage } from "@hookform/error-message";
import RoutAlert from "@/components/popup/RouteAlert";
import { useRouteAlert } from "@/hooks/useRouteAlert";

export default function FindId() {
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
  const { useAlertState, toggleAlert } = useAlert();
  const { useRouteAlertState, toggleRouteAlert } = useRouteAlert();
  const { useVerifyState, toggleVerify } = useVerify();

  const getCertificationNumber = async () => {
    const value = getValues("user_hp");
    if (!value) {
      return setError("user_hp", {
        message: getErrorMassage("user_hp"),
      });
    } else if (!phonePattern.test(watch("user_hp"))) {
      return setError("user_hp", {
        message: getValidMassage("user_hp"),
      });
    } else {
      try {
        const res = await fetch("api/auth/getVerify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_hp: value, type: "find-id" }),
        });

        if (res.ok) {
          const resData = await res.json();
          toggleAlert(resData.message);
          if (resData.resultCode) {
            toggleVerify({
              verify: false,
              timeLimit: 180,
            });
          }
        } else {
          toggleAlert("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
        }
      } catch (error) {
        toggleAlert("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    }
  };

  const postCertificationNumber = async () => {
    const phoneValue = getValues("user_hp");
    const verifyValue = getValues("verify_number");

    if (typeof useVerifyState.timeLimit !== "number") {
      if (useVerifyState.timeLimit === "") {
        return setError("user_hp", {
          message: getErrorMassage("user_hp"),
        });
      } else {
      }
    } else if (!phoneValue) {
      return setError("user_hp", {
        message: getErrorMassage("user_hp"),
      });
    } else if (!verifyValue) {
      return setError("verify_number", {
        message: "인증 번호를 입력해 주세요.",
      });
    } else if (!phonePattern.test(phoneValue)) {
      return setError("user_hp", {
        message: getValidMassage("user_hp"),
      });
    } else if (!onlyNumPattern.test(verifyValue)) {
      return setError("verify_number", {
        message: "인증 번호는 숫자만 입력 가능합니다.",
      });
    } else if (useVerifyState.verify) {
      return toggleAlert("인증이 완료된 전화번호입니다.");
    } else {
      try {
        const value = {
          user_hp: phoneValue,
          verify_number: verifyValue,
        };

        const res = await fetch("api/auth/postVerify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });

        if (res.ok) {
          const resData = await res.json();
          if (resData.resultCode) {
            toggleVerify({
              verify: resData.resultCode,
              seq: resData.data.certification_number,
              timeLimit: "",
            });
            clearErrors("user_hp");
          } else {
            toggleVerify({ verify: resData.resultCode });
          }
          toggleAlert(resData.message);
        } else {
          toggleAlert("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
        }
      } catch (error) {
        toggleAlert("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    }
  };

  useEffect(() => {
    setValue("user_hp", regexValue(phonePattern, watch("user_hp")));
    toggleVerify({ verify: false });
  }, [watch("user_hp"), trigger]);

  useEffect(() => {
    setValue(
      "verify_number",
      regexValue(onlyNumPattern, watch("verify_number"))
    );
  }, [watch("verify_number"), trigger]);

  const onSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const nameValue = getValues("user_name");
    const hpValue = getValues("user_hp");

    if (
      !nameValue ||
      !hpValue ||
      !useVerifyState.verify ||
      !useVerifyState.seq
    ) {
      if (!nameValue) {
        setError("user_name", {
          type: "empty",
          message: "이름을 입력해 주세요.",
        });
      }
      if (!useVerifyState.verify || !useVerifyState.seq) {
        setError("user_hp", {
          type: "empty",
          message: "전화번호를 인증해 주세요.",
        });
      }
      if (!hpValue) {
        setError("user_hp", {
          type: "empty",
          message: "전화번호를 입력해 주세요.",
        });
      }
      return;
    } else {
      try {
        const value = {
          user_name: nameValue,
          user_hp: hpValue,
          user_certification: useVerifyState.seq,
        };

        const res = await fetch("api/auth/findId", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });

        if (res.ok) {
          const resData = await res.json();
          if (resData.resultCode) {
            reset();
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
    <div className={styles.findId}>
      <AuthHeader type={"id"}></AuthHeader>
      <form>
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
              {...register("user_name", {
                required: true,
              })}
            />
          </div>
          <ErrorMessage
            errors={errors}
            name="user_name"
            render={({ message }) => (
              <p className={commonStyles.errorMessage}>{message}</p>
            )}
          />
          <PhoneNumberInput
            hpRegister={{
              ...register("user_hp", {
                required: true,
                pattern: {
                  value: phonePattern,
                  message:
                    "잘못된 휴대 전화 번호입니다. 확인 후 다시 입력해 주세요.",
                },
              }),
            }}
            verifyRegister={{
              ...register("verify_number", {
                required: true,
              }),
            }}
            errors={errors}
            getCertificationNumber={getCertificationNumber}
            postCertificationNumber={postCertificationNumber}
          />
        </div>

        <div className={commonStyles.buttonFooterWrapper}>
          <button
            type="submit"
            className={`button ${commonStyles.buttonFooter}`}
            onClick={(e) => onSubmit(e)}
          >
            아이디 찾기
          </button>
        </div>
      </form>
      {useAlertState.isActOpen && <Alert />}
      {useRouteAlertState.isActOpen && <RoutAlert />}
    </div>
  );
}
