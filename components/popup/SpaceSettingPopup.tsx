import styles from "@styles/components/_popup.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import inputStyles from "@styles/components/_input.module.scss";
import { useSpaceSettingPopup } from "@hooks/popup/useSpaceSettingPopup";
import { SpaceData, useSpace } from "@hooks/user/useSpace";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useImageCrop } from "@hooks/useImageCrop";
import { useScrollLock } from "@hooks/useScrollLock";
import ImageCropInput from "../input/ImageCropInput";
import { useFnAndCancelAlert } from "@hooks/popup/useFnAndCancelAlert";
import FnAndCancelAlert from "./FnAndCancelAlert";
import { useAlert } from "@hooks/popup/useAlert";
import Alert from "./Alert";

export default function SpaceSettingPopup() {
  const { useSpaceSettingState, toggleSpaceSettingPopup } =
    useSpaceSettingPopup();
  const { useSpaceState, selectedSpace, updateSpace, deleteSpace } = useSpace();
  const [spaceInfo, setSpaceInfo] = useState<SpaceData | null>(
    useSpaceState.find((space: SpaceData) => space.UID === selectedSpace) ||
      null
  );
  const { useImageCropState, setImageCustom, setImageSource } = useImageCrop();
  const imgUploadInput = useRef<HTMLInputElement | null>(null);
  const { isLocked, toggleScrollLock } = useScrollLock();
  const [spaceName, setSpaceName] = useState<string>("");
  const [spacePublic, setSpacePublic] = useState<boolean>(true);
  const { useAlertState, toggleAlert } = useAlert();
  const { useFnAndCancelAlertState, toggleFnAndCancelAlert } =
    useFnAndCancelAlert();

  useEffect(() => {
    const foundSpace = useSpaceState.find(
      (space: SpaceData) => space.UID === selectedSpace
    );
    if (foundSpace) {
      setSpaceInfo(foundSpace);
      setSpaceName(foundSpace.space_name);
      setSpacePublic(foundSpace.space_public);
      setImageSource(foundSpace.space_profile_path);
    } else {
      toggleFnAndCancelAlert({
        isActOpen: true,
        content: "스페이스 정보를 찾을 수 없습니다.",
        fn: () => toggleSpaceSettingPopup(false),
      });
    }
  }, [selectedSpace, useSpaceState]);

  const handleMode = (mode: string) => {
    if (useSpaceSettingState.mode !== mode) {
      toggleSpaceSettingPopup({
        isActOpen: useSpaceSettingState.isActOpen,
        mode: mode,
      });
    }
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

  const isValidImageType = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    return validTypes.includes(file.type);
  };

  const handleUpdateSpace = () => {
    if (
      spaceName === spaceInfo?.space_name &&
      spacePublic === spaceInfo?.space_public &&
      (useImageCropState.imageSource === null ||
        useImageCropState.imageSource! == "" ||
        !useImageCropState.imageFile)
    ) {
      return toggleAlert("변경된 정보가 없습니다.");
    }

    const formData = new FormData();

    formData.append("spaceUid", JSON.stringify(spaceInfo?.UID));

    if (spaceName !== spaceInfo?.space_name) {
      formData.append("spaceName", JSON.stringify(spaceName));
    }
    if (spacePublic !== spaceInfo?.space_public) {
      formData.append("spacePublic", JSON.stringify(spacePublic));
    }
    if (
      useImageCropState.imageSource !== spaceInfo?.space_profile_path &&
      useImageCropState.imageFile
    ) {
      formData.append("spaceProfile", useImageCropState.imageFile);
    }
    updateSpace(formData);
  };

  const handleDeleteSpace = () => {
    // 스페이스가 하나인 경우 삭제 불가
    if (useSpaceState.length <= 1) {
      return toggleAlert("최소한 하나의 스페이스를 가지고 있어야 합니다.");
    }
    toggleFnAndCancelAlert({
      isActOpen: true,
      content: "삭제한 스페이스는 복구할 수 없습니다. 삭제하시겠습니까?",
      fn: deleteSpace,
    });
  };

  return (
    <>
      <div className={styles.popup}>
        <div className={styles.dim} />
        <div className={styles.popupWrapper}>
          <div className={buttonStyles.tapButtonWrapper}>
            <button
              type="button"
              className={`button ${buttonStyles.tapButton} ${
                useSpaceSettingState.mode === "setting"
                  ? buttonStyles.active
                  : ""
              }`}
              onClick={() => handleMode("setting")}
            >
              설&nbsp;정
            </button>
            <button
              type="button"
              className={`button ${buttonStyles.tapButton} ${
                useSpaceSettingState.mode === "member"
                  ? buttonStyles.active
                  : ""
              }`}
              onClick={() => handleMode("member")}
            >
              멤&nbsp;버
            </button>
          </div>
          <button
            type="button"
            className={`button ${buttonStyles.closeButton}`}
            title="닫 기"
            onClick={() => toggleSpaceSettingPopup(false)}
          >
            <img src="/images/icon/close.svg" alt="close" />
          </button>

          <div className={buttonStyles.tapWrapper}>
            {useSpaceSettingState.mode === "setting" ? (
              <div className={styles.setting}>
                <h1>스페이스 설정</h1>
                <div className={styles.settingMenu}>
                  <p>이름</p>

                  <div className={inputStyles.inputText}>
                    <input
                      type="text"
                      className="input"
                      style={{ width: "calc(100% - 22px)" }}
                      value={spaceName}
                      onChange={(e) => setSpaceName(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.settingMenu}>
                  <p>프로필 이미지</p>
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
                        {spaceInfo?.space_name.charAt(0)}
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
                <div className={styles.settingMenu}>
                  <p>공개 설정</p>
                  <button
                    type="button"
                    className={`button ${buttonStyles.toggleButton} ${
                      spacePublic ? "" : buttonStyles.disabled
                    }`}
                    title="공개 설정"
                    onClick={() => setSpacePublic(!spacePublic)}
                  />
                </div>
                <div className={styles.settingMenu}>
                  <button
                    type="button"
                    className={`button ${buttonStyles.buttonBorderRed} ${styles.buttonDelete}`}
                    title="스페이스 삭제"
                    onClick={handleDeleteSpace}
                  >
                    스페이스 삭제
                  </button>
                  <p
                    className="normal"
                    style={{ fontSize: "12px", marginTop: "15px" }}
                  >
                    * 스페이스의 모든 페이지가 삭제되고 홈 페이지로 돌아갑니다.
                  </p>
                </div>
                <div className={styles.settingButton}>
                  <button
                    type="button"
                    className={`button ${buttonStyles.buttonBorderBlue}`}
                    onClick={() => toggleSpaceSettingPopup(false)}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className={`button ${buttonStyles.buttonBlue}`}
                    onClick={handleUpdateSpace}
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.member}></div>
            )}
          </div>
        </div>
      </div>
      {isLocked && <ImageCropInput />}
      {useAlertState.isActOpen && <Alert />}
      {useFnAndCancelAlertState.isActOpen && <FnAndCancelAlert />}
    </>
  );
}
