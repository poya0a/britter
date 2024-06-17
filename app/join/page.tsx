"use client";
import commonStyles from "@styles/components/_common.module.scss";
import styles from "./page.module.scss";
import AuthHeader from "@components/common/AuthHeader";
import ImageCropInput from "@components/input/ImageCropInput";
import PasswordInput from "@components/input/PasswordInput";
import PhoneNumberInput from "@components/input/PhoneNumberInput";
import { useImageCrop } from "@hooks/useImageCrop";
import { ChangeEvent, useEffect, useRef } from "react";
import { useScrollLock } from "@hooks/useScrollLock";
import Image from "next/image";
import profile from "/public/images/profile.svg";
import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import {
  birthPattern,
  emailPattern,
  idPattern,
  passwordPattern,
  phonePattern,
} from "@/utils/regex";
import { JoinForm } from "./interface/join.interface";
import { useAlert } from "@/hooks/useAlert";
import Alert from "@components/popup/Alert";

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
  const { useImageCropState, setImageCustom, setImageSource, updateImageFile } =
    useImageCrop();
  const { isLocked, toggleScrollLock } = useScrollLock();
  const { useAlertState, toggleAlert } = useAlert();
  const imgUploadInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setImageSource(profile);
    updateProfile(profile);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageCustom(e.target!.result as string);
        toggleScrollLock(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "profile_image.jpg", {
        type: "image/jpeg",
      });
      updateImageFile(file);
    } catch (error) {
      console.error("Error fetching or creating file:", error);
    }
  };

  const handleDoubleCheck = async (
    e: React.MouseEvent<HTMLButtonElement>,
    type: string
  ) => {
    e.preventDefault();
    try {
      const res = await fetch("api/auth/check/id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "asdasd" }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
    } catch (error) {
    } finally {
    }
  };

  const handleDupleCheck = async (type: "id" | "email") => {
    const name = type === "id" ? "user_id" : "user_email";
    const value = getValues(name);
    let api = "";

    if (!value) {
      setError(name, {
        message: `${
          name === "user_id" ? "아이디를" : "이메일을"
        } 입력해 주세요.`,
      });
      return;
    } else {
      if (name === "user_id" && !idPattern.test(watch(name))) {
        setError(name, {
          message:
            "6자리 이상 15자 이하 영문 혹은 영문과 숫자를 조합하여 입력해 주세요.",
        });
        return;
      } else if (name === "user_email" && !emailPattern.test(value)) {
        setError(name, {
          message: "이메일 형식이 올바르지 않습니다.",
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

          if (res) {
            const data = await res.json();
            toggleAlert(data.message);
          }
        } catch (error) {
        } finally {
        }
      }
    }
  };

  return (
    <div className={styles.join}>
      {isLocked && <ImageCropInput />}
      <AuthHeader type={"join"}></AuthHeader>
      <form>
        <div className={styles.joinWrapper}>
          <div className={commonStyles.profile}>
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
              className={`button ${commonStyles.buttonProfileUpload}`}
              onClick={(e) => {
                e.preventDefault();
                if (imgUploadInput.current) {
                  imgUploadInput.current.click();
                }
              }}
            />
          </div>
          <div className={commonStyles.inputCheck}>
            <label htmlFor="user_id" className={commonStyles.required}>
              아이디
            </label>
            <div className={commonStyles.inputCheckWrapper}>
              <input
                id="userId"
                type="text"
                className="input"
                placeholder="아이디를 입력해 주세요."
                autoComplete="new-id"
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
              <p className={commonStyles.errorMessage}>{message}</p>
            )}
          />
          <PasswordInput
            id="userPw"
            name="비밀번호"
            placeholder="비밀번호를 입력해 주세요."
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
          <div className={commonStyles.inputText}>
            <label htmlFor="userName" className={commonStyles.required}>
              이름
            </label>
            <input
              type="text"
              id="userName"
              className="input"
              placeholder="이름을 입력해 주세요."
              {...register("user_name", { required: true })}
            />
            <ErrorMessage
              errors={errors}
              name="user_name"
              render={({ message }) => (
                <p className={commonStyles.errorMessage}>{message}</p>
              )}
            />
          </div>
          <PhoneNumberInput
            register={{
              ...register("user_hp", {
                required: true,
                pattern: {
                  value: phonePattern,
                  message:
                    "잘못된 휴대폰 번호입니다. 확인 후 다시 입력해 주세요.",
                },
              }),
            }}
            errors={errors}
          />
          <div className={commonStyles.inputCheck}>
            <label htmlFor="user_email">이메일</label>
            <div className={commonStyles.inputCheckWrapper}>
              <input
                type="text"
                id="user_email"
                className="input"
                placeholder="이메일 입력해 주세요."
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
              <p className={commonStyles.errorMessage}>{message}</p>
            )}
          />
          <div className={commonStyles.inputText}>
            <label htmlFor="userNickName">닉네임</label>
            <input
              type="text"
              id="userNickName"
              className="input"
              placeholder="닉네임을 입력해 주세요."
              {...register("user_nick_name", { required: false })}
            />
          </div>
          <div className={commonStyles.inputText}>
            <label htmlFor="userBirth">생년월일</label>
            <input
              type="text"
              id="userBirth"
              className="input"
              placeholder="생년월일을 입력해 주세요."
              {...register("user_birth", {
                required: true,
                pattern: {
                  value: birthPattern,
                  message: "생년월일 형식이 올바르지 않습니다.",
                },
              })}
            />
          </div>
        </div>
        <ErrorMessage
          errors={errors}
          name="user_birth"
          render={({ message }) => (
            <p className={commonStyles.errorMessage}>{message}</p>
          )}
        />
        <div className={commonStyles.buttonFooterWrapper}>
          <button
            type="button"
            className={`button ${commonStyles.buttonFooter}`}
          >
            회원 가입
          </button>
        </div>
      </form>
      {useAlertState.isActOpen && <Alert />}
    </div>
  );
}
