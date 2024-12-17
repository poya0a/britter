import { ChangeEvent, useEffect, useRef, useState } from "react";
import styles from "@styles/components/_popup.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import inputStyles from "@styles/components/_input.module.scss";
import { useForm } from "react-hook-form";
import EmojiPicker from "emoji-picker-react";
import { useInfoStore } from "@stores/user/useInfoStore";
import { useUserSettingPopupStore } from "@stores/popup/useUserSettingPopupStore";
import Image from "next/image";
import { useImageCropStore } from "@stores/useImageCropStore";
import { useScrollLockStore } from "@stores/useScrollLockStore";
import ImageCropInput from "../input/ImageCropInput";
import { useFnAndCancelAlertStore } from "@stores/popup/useFnAndCancelAlertStore";
import { useFnAlertStore } from "@stores/popup/useFnAlertStore";
import { useAlertStore } from "@stores/popup/useAlertStore";
import { useRouteAlertStore } from "@stores/popup/useRouteAlertStore";
import PhoneNumberInput from "../input/PhoneNumberInput";
import {
  regexValue,
  birthPattern,
  onlyNumPattern,
  phonePattern,
  emailPattern,
  passwordPattern,
} from "@utils/regex";
import { getErrorMassage, getValidMassage } from "@utils/errorMessage";
import { useVerifyStore } from "@stores/auth/useVerifyStore";
import { ErrorMessage } from "@hookform/error-message";
import PasswordInput from "../input/PasswordInput";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import storage from "@fetch/auth/storage";
import { useToastStore } from "@stores/popup/useToastStore";

export default function UserSettingPopup() {
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
  } = useForm({ mode: "onChange" });

  const userProfileRef = useRef<HTMLDivElement>(null);
  const { toggleUserSettingPopup } = useUserSettingPopupStore();
  const { useInfoState, updateInfo, fetchInfo } = useInfoStore();
  const {
    useImageCropState,
    setImageCustom,
    setImageSource,
    reset: imageReset,
  } = useImageCropStore();
  const imgUploadInput = useRef<HTMLInputElement | null>(null);
  const { isLocked, toggleScrollLock } = useScrollLockStore();
  const { useVerifyState, toggleVerify } = useVerifyStore();
  const [updateUserPw, setUpdateUserPw] = useState<boolean>(false);
  const [updateUserHp, setUpdateUserHp] = useState<boolean>(false);
  const [userHp, setUserHp] = useState<string>("");
  const [dupleCheck, setDupleCheck] = useState<boolean>(false);
  const emojiPickerRef = useRef<HTMLButtonElement>(null);
  const [emojiPopup, setEmojiPopup] = useState<{
    isActOpen: boolean;
    position: { top: number; left: number };
  }>({
    isActOpen: false,
    position: { top: 0, left: 0 },
  });
  const [statusEmoji, setStatusEmoji] = useState<string>("");
  const [userStatus, setUserStatus] = useState<string>("");
  const [userPublic, setUserPublic] = useState<boolean>(true);
  const [userWithdraw, setUserWithdraw] = useState<boolean>(false);
  const { toggleAlert } = useAlertStore();
  const { setToast } = useToastStore();
  const { toggleFnAndCancelAlert } = useFnAndCancelAlertStore();
  const { toggleFnAlert } = useFnAlertStore();
  const { toggleRouteAlert } = useRouteAlertStore();

  useEffect(() => {
    if (useInfoState) {
      setValue("user_name", useInfoState.user_name || "");
      setUserHp(useInfoState.user_hp);
      setValue("user_email", useInfoState.user_email || "");
      setValue("user_birth", useInfoState.user_birth || "");
      setUserPublic(useInfoState.user_public);
      if (useInfoState.user_profile_path) {
        setImageSource(useInfoState.user_profile_path);
      }
      if (useInfoState.status_emoji) {
        setStatusEmoji(useInfoState.status_emoji);
      }
      if (useInfoState.status_message) {
        setUserStatus(useInfoState.status_message);
      }
    }
  }, []);

  const isValidImageType = (file: File) => {
    const validTypes = ["png", "jpg", "jpeg"];
    const extension = file.name.split(".").pop()?.toLowerCase();
    return extension ? validTypes.includes(extension) : false;
  };

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

  const handleDupleCheck = async () => {
    const value = getValues("user_email");

    if (!value) {
      setError("user_email", {
        message: getErrorMassage("user_email"),
      });
      return;
    } else {
      if (!emailPattern.test(value)) {
        setError("user_email", {
          message: getValidMassage("user_email"),
        });
        return;
      } else {
        try {
          const res = await fetch("api/auth/check/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_email: value }),
          });

          if (res.ok) {
            const resData = await res.json();
            toggleAlert(resData.message);

            setDupleCheck(resData.resultCode);
            clearErrors("user_email");
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

  useEffect(() => {
    // 외부 클릭을 감지하는 함수
    const handleClickOutsideEmojiPopup = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest) return;
      const closestIgnoreElement = target.closest(
        "[data-ignore-outside-click]"
      );

      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(target) &&
        (!closestIgnoreElement ||
          closestIgnoreElement.getAttribute("data-ignore-outside-click") !==
            "true")
      ) {
        setEmojiPopup({
          isActOpen: false,
          position: { top: 0, left: 0 },
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutsideEmojiPopup);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideEmojiPopup);
    };
  }, []);

  // 스크롤 이벤트 발생 시 이모지 팝업 닫기 처리
  const handleScrollOutsideEmojiPopup = (e: Event) => {
    if (!emojiPickerRef.current) return;

    const target = e.target as HTMLElement;
    const closestIgnoreElement = target.closest?.(
      "[data-ignore-outside-click]"
    );

    if (
      !emojiPickerRef.current.contains(target) &&
      (!closestIgnoreElement ||
        closestIgnoreElement.getAttribute("data-ignore-outside-click") !==
          "true")
    ) {
      setEmojiPopup({
        isActOpen: false,
        position: { top: 0, left: 0 },
      });
    }
  };

  useEffect(() => {
    if (emojiPopup.isActOpen) {
      window.addEventListener("scroll", handleScrollOutsideEmojiPopup, true);
    } else {
      window.removeEventListener("scroll", handleScrollOutsideEmojiPopup, true);
    }

    return () => {
      window.removeEventListener("scroll", handleScrollOutsideEmojiPopup, true);
    };
  }, [emojiPopup.isActOpen]);

  const handleUpdatePassword = async () => {
    const userOriginalPw = getValues("user_original_pw");
    const userPw = getValues("user_pw");
    const userPwConfirm = getValues("user_pw_check");
    const passwordField = ["user_original_pw", "user_pw", "user_pw_check"];

    if (
      Object.keys(errors).filter((fieldName) =>
        passwordField.includes(fieldName)
      ).length > 0
    ) {
      Object.keys(errors)
        .filter((fieldName) => passwordField.includes(fieldName))
        .forEach((fieldName) => {
          setError(fieldName, {
            type: "valid",
            message: getValidMassage(fieldName),
          });
        });
    } else if (userPw !== userPwConfirm) {
      setError("user_pw_check", {
        type: "valid",
        message: "비밀번호가 일치하지 않습니다.",
      });
    } else if (userOriginalPw === userPw) {
      setError("user_pw", {
        type: "valid",
        message: "기존 비밀번호와 동일합니다.",
      });
    } else {
      clearErrors();
      const formData = new FormData();

      formData.append("userOriginalPw", JSON.stringify(userOriginalPw));
      formData.append("userPw", JSON.stringify(userPw));

      const res = await fetchApi({
        method: "POST",
        url: requests.UPDATE_PASSWORD,
        body: formData,
      });

      if (!res.resultCode) {
        toggleAlert(res.message);
        return res.message;
      } else {
        toggleFnAlert({
          isActOpen: true,
          content: "비밀번호가 변경되었습니다. 다시 로그인해 주세요.",
          fn: () => {
            setUpdateUserPw(false);
            reset();
            toggleUserSettingPopup(false);
            logout();
          },
        });
      }
    }
  };

  const logout = async () => {
    const res = await fetchApi({
      method: "GET",
      url: requests.LOGOUT,
    });

    if (!res.resultCode) {
      toggleAlert(res.message);
    }
    storage.removeToken();
    toggleRouteAlert({
      isActOpen: true,
      content: res.message,
      route: "/login",
    });
  };

  const handleUpdateHp = async () => {
    const userHp = getValues("user_hp");
    const hpField = ["user_hp", "verify_number"];

    if (
      Object.keys(errors).filter((fieldName) => hpField.includes(fieldName))
        .length > 0
    ) {
      Object.keys(errors)
        .filter((fieldName) => hpField.includes(fieldName))
        .forEach((fieldName) => {
          setError(fieldName, {
            type: "valid",
            message: getValidMassage(fieldName),
          });
        });
    } else if (useInfoState.user_hp === userHp) {
      setError("user_hp", {
        type: "custom",
        message: "기존 전화번호와 동일합니다.",
      });
    } else if (!useVerifyState.verify || !useVerifyState.seq) {
      setError("user_hp", {
        type: "custom",
        message: "전화번호를 인증해 주세요.",
      });
    } else {
      clearErrors();
      const formData = new FormData();

      formData.append("userHp", JSON.stringify(userHp));
      formData.append("userCertification", JSON.stringify(useVerifyState.seq));

      const res = await fetchApi({
        method: "POST",
        url: requests.UPDATE_HP,
        body: formData,
      });

      if (!res.resultCode) {
        toggleAlert(res.message);
        return res.message;
      } else {
        // 전화번호 초기화
        setUpdateUserHp(false);
        setDupleCheck(false);
        setValue("user_hp", "");
        setValue("verify_number", "");
        setUserHp(userHp);
        fetchInfo();
        setToast("전화번호가 변경되었습니다.");
      }
    }
  };

  const changeValueCheck = (): boolean => {
    const data = getValues();
    const prevData = useInfoState;

    const fieldMappings = [
      {
        key: "userProfile",
        newValue: useImageCropState.imageSource,
        prevValue: prevData.user_profile_path,
        file: useImageCropState.imageFile,
      },
      {
        key: "userName",
        newValue: data.user_name,
        prevValue: prevData.user_name,
      },
      {
        key: "userEmail",
        newValue: data.user_email,
        prevValue: prevData.user_email,
      },
      {
        key: "userBirth",
        newValue: data.user_birth,
        prevValue: prevData.user_birth,
      },
      {
        key: "statusEmoji",
        newValue: statusEmoji,
        prevValue: prevData.status_emoji,
      },
      {
        key: "statusMessage",
        newValue: userStatus,
        prevValue: prevData.status_message,
      },
      {
        key: "userPublic",
        newValue: userPublic,
        prevValue: prevData.user_public,
      },
    ];
    return fieldMappings.some(({ key, newValue, prevValue, file }) => {
      if (key === "userProfile") {
        return newValue !== prevValue && file;
      }
      return newValue !== "" && newValue !== prevValue;
    });
  };

  const handleWarningBeforeClosing = () => {
    const changed = changeValueCheck();
    if (changed) {
      toggleFnAndCancelAlert({
        isActOpen: true,
        content: "수정한 내용이 저장되지 않을 수 있습니다. 닫으시겠습니까?",
        fn: () => {
          toggleUserSettingPopup(false);
        },
      });
    } else {
      toggleUserSettingPopup(false);
    }
  };

  const handleWithdraw = () => {
    const userWithdrawPw = getValues("user_withdraw_pw");

    if (
      !userWithdrawPw ||
      userWithdrawPw === "" ||
      userWithdrawPw === undefined
    ) {
      toggleAlert("회원 탈퇴를 위해 비밀번호를 입력해 주세요.");
    } else {
      toggleFnAndCancelAlert({
        isActOpen: true,
        content:
          "매니저 권한의 스페이스와 작성한 게시글 및 모든 정보가 삭제됩니다. 탈퇴하시겠습니까?",
        fn: withdrawUserInfo,
      });
    }
  };

  const withdrawUserInfo = async () => {
    const userWithdrawPw = getValues("user_withdraw_pw");
    const res = await fetchApi({
      method: "POST",
      url: requests.POST_WITHDRAW,
      body: JSON.stringify({ userWithdrawPw: userWithdrawPw }),
    });

    if (!res.resultCode) {
      toggleAlert(res.message);
      return res.message;
    } else {
      storage.removeToken();
      toggleRouteAlert({
        isActOpen: true,
        content: res.message,
        route: "/login",
      });
    }
  };

  const handleUpdate = () => {
    const changed = changeValueCheck();
    const emailValue = getValues("user_email");
    const ignore = [
      "user_original_pw",
      "user_pw",
      "user_pw_check",
      "user_hp",
      "verify_number",
      "user_withdraw_pw",
    ];

    if (!changed) {
      toggleAlert("수정된 정보가 없습니다.");
    } // 유효성 에러
    else if (
      Object.keys(errors).filter((fieldName) => !ignore.includes(fieldName))
        .length > 0
    ) {
      Object.keys(errors)
        .filter((fieldName) => !ignore.includes(fieldName))
        .forEach((fieldName) => {
          setError(fieldName, {
            type: "valid",
            message: getValidMassage(fieldName),
          });
        });
    } else if (
      emailValue &&
      emailValue !== useInfoState.user_email &&
      !dupleCheck
    ) {
      setError("user_email", {
        type: "custom",
        message: "이메일 중복을 확인해 주세요.",
      });
    } else {
      toggleFnAndCancelAlert({
        isActOpen: true,
        content: "저장하시겠습니까?",
        fn: updateUserInfo,
      });
    }
  };

  const updateUserInfo = () => {
    const formData = new FormData();
    const data = getValues();
    const prevData = useInfoState;

    const fieldMappings = [
      {
        key: "userProfile",
        newValue: useImageCropState.imageSource,
        prevValue: prevData.user_profile_path,
        file: useImageCropState.imageFile,
      },
      {
        key: "userName",
        newValue: data.user_name,
        prevValue: prevData.user_name,
      },
      {
        key: "userEmail",
        newValue: data.user_email,
        prevValue: prevData.user_email,
      },
      {
        key: "userBirth",
        newValue: data.user_birth,
        prevValue: prevData.user_birth,
      },
      {
        key: "statusEmoji",
        newValue: statusEmoji,
        prevValue: prevData.status_emoji,
      },
      {
        key: "statusMessage",
        newValue: userStatus,
        prevValue: prevData.status_message,
      },
      {
        key: "userPublic",
        newValue: userPublic,
        prevValue: prevData.user_public,
      },
    ];

    fieldMappings.forEach(({ key, newValue, prevValue, file }) => {
      if (file && key === "userProfile" && newValue !== prevValue) {
        formData.append(key, file);
      } else if (newValue !== "" && newValue !== prevValue) {
        formData.append(key, JSON.stringify(newValue));
      }
    });

    updateInfo(formData);
  };

  // 이미지 정보 초기화
  useEffect(() => {
    const handleBeforeUnload = () => {
      imageReset();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      imageReset();
    };
  }, [imageReset]);

  return (
    <>
      <div className={styles.popup}>
        <div className={styles.dim} onClick={handleWarningBeforeClosing} />
        <div className={styles.popupWrapper}>
          <form>
            <div className={styles.profile} ref={userProfileRef}>
              <div className={styles.profileWrapper}>
                <div className={inputStyles.profile}>
                  {useImageCropState.imageSource !== null &&
                  useImageCropState.imageSource !== "" ? (
                    <Image
                      src={useImageCropState.imageSource as string}
                      alt="profile"
                      width={120}
                      height={120}
                    />
                  ) : (
                    <i className="normal">
                      {useInfoState?.user_name.charAt(0)}
                    </i>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={imgUploadInput}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    onClick={() => {
                      if (imgUploadInput.current)
                        imgUploadInput.current.value = "";
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
              </div>
              <div className={styles.profileItem}>
                <div className={inputStyles.inputText}>
                  <label>아이디</label>
                  <p>{useInfoState.user_id}</p>
                </div>
              </div>
              <div className={styles.profileItem}>
                {updateUserPw && (
                  <div style={{ marginBottom: "20px" }}>
                    <PasswordInput
                      id="userOriginalPw"
                      name="비밀번호"
                      placeholder="비밀번호를 입력해 주세요."
                      register={{
                        ...register("user_original_pw", {
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
                      name="user_original_pw"
                      render={({ message }) => (
                        <p className={inputStyles.errorMessage}>{message}</p>
                      )}
                    />
                    <PasswordInput
                      id="userPw"
                      name="새 비밀번호"
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
                      name="새 비밀번호 확인"
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
                  </div>
                )}
                <button
                  type="button"
                  className={`button ${buttonStyles.buttonDarkBlue}`}
                  title={`비밀번호 ${updateUserPw ? "저장" : "변경"}`}
                  onClick={() => {
                    if (!updateUserPw) {
                      setUpdateUserPw(true);
                    } else {
                      handleUpdatePassword();
                    }
                  }}
                >
                  비밀번호 {updateUserPw ? "저장" : "변경"}
                </button>
              </div>
              <div className={styles.profileItem}>
                <div className={inputStyles.inputText}>
                  <label htmlFor="user_name" className={inputStyles.required}>
                    이름
                  </label>
                  <input
                    type="text"
                    id="user_name"
                    className="input"
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
              </div>
              <div className={styles.profileItem}>
                {!updateUserHp ? (
                  <div className={inputStyles.inputText}>
                    <label>전화번호</label>
                    <p style={{ margin: "5px 0 20px 0" }}>{userHp}</p>
                  </div>
                ) : (
                  <div style={{ margin: "5px 0 20px 0" }}>
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
                )}

                <button
                  type="button"
                  className={`button ${buttonStyles.buttonDarkBlue}`}
                  title={`전화번호 ${updateUserHp ? "저장" : "변경"}`}
                  onClick={() => {
                    if (!updateUserHp) {
                      setUpdateUserHp(true);
                    } else {
                      handleUpdateHp();
                    }
                  }}
                >
                  전화번호 {updateUserHp ? "저장" : "변경"}
                </button>
              </div>
              <div className={styles.profileItem}>
                <div className={inputStyles.inputText}>
                  <label htmlFor="user_email">이메일</label>
                  <div className={inputStyles.inputCheckWrapper}>
                    <input
                      type="text"
                      id="user_email"
                      className="input"
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
                      onClick={handleDupleCheck}
                    >
                      중복 확인
                    </button>
                  </div>
                  <ErrorMessage
                    errors={errors}
                    name="user_email"
                    render={({ message }) => (
                      <p className={inputStyles.errorMessage}>{message}</p>
                    )}
                  />
                </div>
              </div>
              <div className={styles.profileItem}>
                <div className={inputStyles.inputText}>
                  <label htmlFor="user_birth">생년월일</label>
                  <input
                    type="text"
                    id="user_birth"
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
                  <ErrorMessage
                    errors={errors}
                    name="user_birth"
                    render={({ message }) => (
                      <p className={inputStyles.errorMessage}>{message}</p>
                    )}
                  />
                </div>
              </div>
              <div className={styles.profileItem}>
                <div className={inputStyles.inputText}>
                  <label>상태</label>
                  <div className={styles.profileStatus}>
                    <button
                      type="button"
                      className={`button ${buttonStyles.buttonEmoji}`}
                      onClick={(e) =>
                        setEmojiPopup({
                          isActOpen: !emojiPopup.isActOpen,
                          position: {
                            top: e.clientY,
                            left: e.clientX,
                          },
                        })
                      }
                      ref={emojiPickerRef}
                    >
                      <i>{statusEmoji}</i>
                    </button>
                    <input
                      type="text"
                      className="input"
                      maxLength={100}
                      value={userStatus}
                      onChange={(e) => setUserStatus(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.profileItem}>
                <p>공개 설정</p>
                <button
                  type="button"
                  className={`button ${buttonStyles.toggleButton} ${
                    userPublic ? "" : buttonStyles.disabled
                  }`}
                  title="공개 설정"
                  onClick={() => setUserPublic(!userPublic)}
                />
              </div>
              <div className={styles.profileItem}>
                {userWithdraw && (
                  <div style={{ marginBottom: "20px" }}>
                    <PasswordInput
                      id="userWithdrawPw"
                      name="비밀번호"
                      placeholder="회원 탈퇴를 위해 비밀번호를 입력해 주세요."
                      register={{
                        ...register("user_withdraw_pw", {
                          required: true,
                        }),
                      }}
                    />
                  </div>
                )}
                <button
                  type="button"
                  className={`button ${buttonStyles.buttonBorderRed}`}
                  title="회원 탈퇴"
                  onClick={() => {
                    if (!userWithdraw) {
                      setUserWithdraw(true);
                    } else {
                      handleWithdraw();
                    }
                  }}
                >
                  회원 탈퇴
                </button>
              </div>
            </div>
          </form>
          <div className={styles.profileButtonWrapper}>
            <button
              type="button"
              className={`button ${buttonStyles.buttonBorderBlue}`}
              onClick={handleWarningBeforeClosing}
            >
              취소
            </button>
            <button
              type="button"
              className={`button ${buttonStyles.buttonBlue}`}
              onClick={handleUpdate}
            >
              저장
            </button>
          </div>
        </div>
      </div>
      {isLocked && <ImageCropInput />}
      {emojiPopup.isActOpen &&
        emojiPopup.position.top !== 0 &&
        emojiPopup.position.left !== 0 && (
          <div
            className={styles.emojiPickerWrapper}
            style={{
              top: emojiPopup.position.top,
              left: emojiPopup.position.left,
            }}
            data-ignore-outside-click
          >
            <EmojiPicker
              // previewConfig={{ defaultEmoji: statusEmoji }}
              onEmojiClick={(e) => setStatusEmoji(e.emoji)}
              autoFocusSearch
            />
          </div>
        )}
    </>
  );
}
