"use client";
import { useRouter } from "next/navigation";
import inputStyles from "@styles/components/_input.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import styles from "./page.module.scss";
import AuthHeader from "@components/common/AuthHeader";
import ImageCropInput from "@components/input/ImageCropInput";
import PasswordInput from "@components/input/PasswordInput";
import PhoneNumberInput from "@components/input/PhoneNumberInput";
import { useImageCrop } from "@hooks/useImageCrop";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useScrollLock } from "@hooks/useScrollLock";
import Image from "next/image";
import profile from "/public/images/profile.svg";
import { ErrorMessage } from "@hookform/error-message";
import { FieldValues, useForm } from "react-hook-form";
import {
  birthPattern,
  emailPattern,
  idPattern,
  onlyNumPattern,
  passwordPattern,
  phonePattern,
  regexValue,
} from "@utils/regex";
import { JoinForm } from "./interface/join.interface";
import { useAlert } from "@hooks/popup/useAlert";
import Alert from "@components/popup/Alert";
import TermsModal from "./TermsModal";
import { useVerify } from "@hooks/auth/useVerify";
import { getErrorMassage, getValidMassage } from "@utils/errorMessage";
import { TermsData, useTerms } from "@hooks/auth/useTerms";
import { useModal } from "@hooks/popup/useModal";

export default function Join() {
  const {
    register,
    getValues,
    trigger,
    setValue,
    watch,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<JoinForm>({ mode: "onChange" });

  const router = useRouter();
  const { useImageCropState, setImageCustom } = useImageCrop();
  const { isLocked, toggleScrollLock } = useScrollLock();
  const { useAlertState, toggleAlert } = useAlert();
  const { useModalState, toggleModal } = useModal();
  const { useTermsState, toggleCheckAll } = useTerms();
  const termsChecked = useTermsState
    ? useTermsState
        .filter((term: TermsData) => term.required)
        .every((term) => term.checked)
    : false;
  const imgUploadInput = useRef<HTMLInputElement | null>(null);
  const [dupleCheck, setDupleCheck] = useState<{
    userId: boolean;
    userEmail: boolean;
  }>({
    userId: false,
    userEmail: false,
  });
  const { useVerifyState, toggleVerify } = useVerify();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (file && isValidImageType(file)) {
      const imageURL = URL.createObjectURL(file);
      setImageCustom(imageURL);
      toggleScrollLock(true);
    } else {
      alert("이미지 파일을 선택해주세요. (JPEG, PNG, GIF 형식만 지원됩니다.)");
      e.target.value = "";
    }
  };

  const isValidImageType = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    return validTypes.includes(file.type);
  };

  const handleDupleCheck = async (type: "id" | "email") => {
    const name = type === "id" ? "user_id" : "user_email";
    const value = getValues(name);
    let api = "";

    if (!value) {
      setError(name, {
        message: getErrorMassage(name),
      });
      return;
    } else {
      if (name === "user_id" && !idPattern.test(watch(name))) {
        setError(name, {
          message: getValidMassage(name),
        });
        return;
      } else if (name === "user_email" && !emailPattern.test(value)) {
        setError(name, {
          message: getValidMassage(name),
        });
        return;
      } else {
        if (name == "user_id") {
          api = "api/auth/check/id";
        } else {
          api = "api/auth/check/email";
        }
        try {
          const res = await fetch(api, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [name]: value }),
          });

          if (res.ok) {
            const resData = await res.json();
            toggleAlert(resData.message);

            setDupleCheck((prevState) => ({
              ...prevState,
              [type === "id" ? "userId" : "userEmail"]: resData.resultCode,
            }));
            clearErrors(name);
          } else {
            const errorData = await res.json();
            toggleAlert(
              errorData.message || "서버와의 통신에 문제가 발생했습니다."
            );
          }
        } catch (error) {
          toggleAlert("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
        }
      }
    }
  };

  const handlePwCheck = () => {
    const pw = getValues("user_pw");
    const pwCheck = getValues("user_pw_check");

    if (pw === pwCheck) {
      clearErrors("user_pw_check");
    }
  };

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
          body: JSON.stringify({ user_hp: value, type: "join" }),
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

  useEffect(() => {
    setValue("user_birth", regexValue(birthPattern, watch("user_birth")));
  }, [watch("user_birth"), trigger]);

  const onSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (
      typeof window !== "undefined" &&
      document.activeElement instanceof HTMLElement
    ) {
      document.activeElement.blur();
    }
    const data: FieldValues = getValues();

    // 빈 값 확인
    const emptyFields: Partial<JoinForm> = {};
    const requiredFields: (keyof JoinForm)[] = [
      "user_id",
      "user_pw",
      "user_pw_check",
      "user_name",
      "user_hp",
      "verify_number",
    ];

    requiredFields.forEach((fieldName) => {
      const value = data[fieldName];
      if (value === undefined || value === null || value === "") {
        emptyFields[fieldName] = value;
      }
    });

    // 필수 이용약관 동의 확인
    const hasAgreeRequiredTerms = useTermsState
      .filter((term) => term.required)
      .every((term) => term.checked);

    if (
      Object.keys(emptyFields).length > 0 ||
      !dupleCheck.userId ||
      data.user_pw !== data.user_pw_check ||
      (!(
        data.user_email === undefined ||
        data.user_email === "" ||
        data.user_email === null
      ) &&
        !dupleCheck.userEmail) ||
      !useVerifyState.verify ||
      !useVerifyState.seq ||
      Object.keys(errors).length > 0
    ) {
      if (Object.keys(emptyFields).length > 0) {
        Object.keys(emptyFields).forEach((fieldName) => {
          setError(fieldName as keyof JoinForm, {
            type: "empty",
            message: getErrorMassage(fieldName),
          });
        });
        return;
      }
      // 유효성 에러
      else if (Object.keys(errors).length > 0) {
        Object.keys(errors).forEach((fieldName) => {
          setError(fieldName as keyof JoinForm, {
            type: "valid",
            message: getValidMassage(fieldName),
          });
        });
        return;
      } else if (
        !dupleCheck.userId ||
        data.user_pw !== data.user_pw_check ||
        (!(
          data.user_email === undefined ||
          data.user_email === "" ||
          data.user_email === null
        ) &&
          !dupleCheck.userEmail) ||
        !useVerifyState.verify ||
        !useVerifyState.seq
      ) {
        if (!dupleCheck.userId) {
          setError("user_id", {
            type: "custom",
            message: "아이디 중복을 확인해 주세요.",
          });
        }
        if (data.user_pw !== data.user_pw_check) {
          setError("user_pw_check", {
            type: "custom",
            message: "비밀번호가 일치하지 않습니다.",
          });
        }
        if (
          !(
            data.user_email === undefined ||
            data.user_email === "" ||
            data.user_email === null
          ) &&
          !dupleCheck.userEmail
        ) {
          setError("user_email", {
            type: "custom",
            message: "이메일 중복을 확인해 주세요.",
          });
        }
        if (!useVerifyState.verify || !useVerifyState.seq) {
          setError("user_hp", {
            type: "custom",
            message: "전화번호를 인증해 주세요.",
          });
        }
        return;
      }
    } else if (!hasAgreeRequiredTerms) {
      toggleAlert("필수 이용 약관에 동의해 주세요.");
      return;
    } else {
      // 불필요한 데이터 삭제
      delete data.user_pw_check;
      delete data.verify_number;

      const formData = new FormData();

      const terms = useTermsState
        .filter((term) => term.checked)
        .map((term) => term.seq);

      for (const key in data) {
        formData.append(key, data[key]);
      }

      formData.append("terms", JSON.stringify(terms));
      formData.append("user_certification", JSON.stringify(useVerifyState.seq));

      if (useImageCropState.imageFile) {
        formData.append("user_profile", useImageCropState.imageFile);
      }

      try {
        const res = await fetch("api/auth/join", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const resData = await res.json();

          if (resData.resultCode) {
            router.push(`/complete?user_id=${data.user_id}`);
            reset();
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
    <div className={styles.join}>
      {isLocked && <ImageCropInput />}
      <AuthHeader type={"join"} />
      <form>
        <div className={styles.joinWrapper}>
          <div className={inputStyles.profile}>
            <Image
              src={
                useImageCropState.imageSource !== null
                  ? (useImageCropState.imageSource as string)
                  : profile
              }
              alt="profile"
              width={120}
              height={120}
            />
            <input
              type="file"
              accept="image/*"
              ref={imgUploadInput}
              style={{ display: "none" }}
              onChange={handleFileChange}
              onClick={() => {
                if (imgUploadInput.current) imgUploadInput.current.value = "";
              }}
              multiple
            />
            <button
              type="button"
              className={`button ${inputStyles.buttonProfileUpload}`}
              onClick={(e) => {
                e.preventDefault();
                if (imgUploadInput.current) {
                  imgUploadInput.current.click();
                }
              }}
            />
          </div>
          <div className={inputStyles.inputText}>
            <label htmlFor="user_id" className={inputStyles.required}>
              아이디
            </label>
            <div className={inputStyles.inputCheckWrapper}>
              <input
                id="userId"
                type="text"
                className="input"
                placeholder="아이디를 입력해 주세요."
                autoComplete="new-id"
                maxLength={15}
                onKeyUp={() =>
                  setDupleCheck({
                    ...dupleCheck,
                    userId: false,
                    userEmail: dupleCheck.userEmail,
                  })
                }
                {...register("user_id", {
                  required: true,
                  pattern: {
                    value: idPattern,
                    message:
                      "6자리 이상 15자 이하 영문 혹은 영문과 숫자를 조합하여 입력해 주세요.",
                  },
                })}
              />
              <button
                type="button"
                className="button"
                onClick={() => handleDupleCheck("id")}
              >
                중복 확인
              </button>
            </div>
          </div>
          <ErrorMessage
            errors={errors}
            name="user_id"
            render={({ message }) => (
              <p className={inputStyles.errorMessage}>{message}</p>
            )}
          />
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
              <p className={inputStyles.errorMessage}>{message}</p>
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
              <p className={inputStyles.errorMessage}>{message}</p>
            )}
          />
          <div className={inputStyles.inputText}>
            <label htmlFor="userName" className={inputStyles.required}>
              이름
            </label>
            <input
              type="text"
              id="userName"
              className="input"
              placeholder="이름을 입력해 주세요."
              maxLength={25}
              {...register("user_name", { required: true })}
            />
            <ErrorMessage
              errors={errors}
              name="user_name"
              render={({ message }) => (
                <p className={inputStyles.errorMessage}>{message}</p>
              )}
            />
          </div>
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
          <div className={inputStyles.inputText}>
            <label htmlFor="user_email">이메일</label>
            <div className={inputStyles.inputCheckWrapper}>
              <input
                type="text"
                id="user_email"
                className="input"
                placeholder="이메일 입력해 주세요."
                maxLength={50}
                {...register("user_email", {
                  required: false,
                  pattern: {
                    value: emailPattern,
                    message: "이메일 형식이 올바르지 않습니다.",
                  },
                })}
              />
              <button
                type="button"
                className="button"
                onClick={() => handleDupleCheck("email")}
              >
                중복 확인
              </button>
            </div>
          </div>
          <ErrorMessage
            errors={errors}
            name="user_email"
            render={({ message }) => (
              <p className={inputStyles.errorMessage}>{message}</p>
            )}
          />
          <div className={inputStyles.inputText}>
            <label htmlFor="userNickName">닉네임</label>
            <input
              type="text"
              id="userNickName"
              className="input"
              placeholder="닉네임을 입력해 주세요."
              maxLength={25}
              {...register("user_nick_name", { required: false })}
            />
          </div>
          <p className={inputStyles.guideMessage}>
            * 닉네임을 입력하지 않는 경우 임시 닉네임이 생성됩니다.
          </p>
          <div className={inputStyles.inputText}>
            <label htmlFor="userBirth">생년월일</label>
            <input
              type="text"
              id="userBirth"
              className="input"
              placeholder="YYYYMMDD"
              maxLength={8}
              {...register("user_birth", {
                required: false,
                pattern: {
                  value: birthPattern,
                  message: "생년월일 형식이 올바르지 않습니다.",
                },
              })}
            />
          </div>
          <ErrorMessage
            errors={errors}
            name="user_birth"
            render={({ message }) => (
              <p className={inputStyles.errorMessage}>{message}</p>
            )}
          />
        </div>

        <div className={inputStyles.inputCheck}>
          <div className={inputStyles.inputCheckWrapper}>
            <input
              type="checkbox"
              className="input"
              checked={termsChecked}
              onChange={() => toggleCheckAll(!termsChecked)}
            />
            <button
              type="button"
              className={`button ${inputStyles.inputCheckButton}`}
              onClick={() => toggleModal(true)}
            >
              이용 약관 동의
            </button>
          </div>
        </div>
        <div className={buttonStyles.buttonFooterWrapper}>
          <button
            type="submit"
            className={`button ${buttonStyles.buttonFooter}`}
            onClick={onSubmit}
          >
            회원 가입
          </button>
        </div>
      </form>
      {useModalState && <TermsModal />}
      {useAlertState.isActOpen && <Alert />}
    </div>
  );
}
