"use client";
import commonStyles from "@styles/components/_common.module.scss";
import styles from "./page.module.scss";
import AuthHeader from "@/components/common/AuthHeader";
import ImageCropInput from "@/components/input/ImageCropInput";
import PasswordInput from "@/components/input/PasswordInput";
import PhoneNumberInput from "@/components/input/PhoneNumberInput";
import { useImageCrop } from "@/hooks/useImageCrop";
import { ChangeEvent, useEffect, useRef } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import Image from "next/image";
import profile from "/public/images/profile.svg";

export default function Join() {
  const { state, setImageCustom, setImageSource, updateImageFile } =
    useImageCrop();
  const { isLocked, toggleScrollLock } = useScrollLock();
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

  return (
    <div className={styles.join}>
      {isLocked && <ImageCropInput />}
      <AuthHeader type={"join"}></AuthHeader>
      <form action="">
        <div className={styles.joinWrapper}>
          <div className={commonStyles.profile}>
            <Image
              src={
                state.imageSource !== null
                  ? (state.imageSource as string)
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
            <label htmlFor="userId" className={commonStyles.required}>
              아이디
            </label>
            <div className={commonStyles.inputCheckWrapper}>
              <input
                type="text"
                id="userId"
                className="input"
                placeholder="아이디를 입력해 주세요."
                autoComplete="new-id"
              />
              <button className="button">중복 확인</button>
            </div>
          </div>
          <PasswordInput
            id="userPw"
            name="비밀번호"
            placeholder="비밀번호를 입력해 주세요."
          />
          <PasswordInput
            id="userPwConfirm"
            name="비밀번호 확인"
            placeholder="비밀번호를 한 번 더 입력해 주세요."
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
            />
          </div>
          <PhoneNumberInput />
          <div className={commonStyles.inputCheck}>
            <label htmlFor="userEmail">이메일</label>
            <div className={commonStyles.inputCheckWrapper}>
              <input
                type="text"
                id="userEmail"
                className="input"
                placeholder="이메일 입력해 주세요."
              />
              <button className="button">중복 확인</button>
            </div>
          </div>

          <div className={commonStyles.inputText}>
            <label htmlFor="userNickName">닉네임</label>
            <input
              type="text"
              id="userNickName"
              className="input"
              placeholder="닉네임을 입력해 주세요."
            />
          </div>

          <div className={commonStyles.inputText}>
            <label htmlFor="userBirth">생년월일</label>
            <input
              type="text"
              id="userBirth"
              className="input"
              placeholder="생년월일을 입력해 주세요."
            />
          </div>
        </div>

        <div className={commonStyles.buttonFooterWrapper}>
          <button
            type="button"
            className={`button ${commonStyles.buttonFooter}`}
          >
            회원 가입
          </button>
        </div>
      </form>
    </div>
  );
}
