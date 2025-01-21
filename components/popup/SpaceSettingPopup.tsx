import { ChangeEvent, useEffect, useRef, useState, KeyboardEvent, useCallback } from "react";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import styles from "@styles/components/_popup.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import inputStyles from "@styles/components/_input.module.scss";
import { useSpaceSettingPopupStore } from "@stores/popup/useSpaceSettingPopupStore";
import { SpaceData, SpaceMemberData, useSpaceStore } from "@stores/user/useSpaceStore";
import { useSearchStore } from "@stores/useSearchStore";
import { useNotificationStore } from "@stores/user/useNotificationStore";
import { useImageCropStore } from "@stores/useImageCropStore";
import { useScrollLockStore } from "@stores/useScrollLockStore";
import ImageCropInput from "../input/ImageCropInput";
import { useFnAndCancelAlertStore } from "@stores/popup/useFnAndCancelAlertStore";
import { useAlertStore } from "@stores/popup/useAlertStore";
import { useUserViewPopupStore } from "@stores/popup/useUserViewPopupStore";

export default function SpaceSettingPopup() {
  const { useSpaceSettingState, toggleSpaceSettingPopup } = useSpaceSettingPopupStore();
  const {
    useSpaceState,
    useSpaceMemeberState,
    useSelectedSpaceState,
    fetchSpace,
    updateSpace,
    deleteSpace,

    setUseSpaceMemeberState,
    spaceMemeberPageInfo,
  } = useSpaceStore();
  const { handleSearchUser } = useSearchStore();
  const { postLeaveNotification } = useNotificationStore();
  const { useImageCropState, setImageCustom, setImageSource, reset } = useImageCropStore();
  const imgUploadInput = useRef<HTMLInputElement | null>(null);
  const { isLocked, toggleScrollLock } = useScrollLockStore();
  const [spaceName, setSpaceName] = useState<string>("");
  const [spacePublic, setSpacePublic] = useState<boolean>(true);
  const { toggleAlert } = useAlertStore();
  const { toggleFnAndCancelAlert } = useFnAndCancelAlertStore();
  const { toggleUserViewPopup } = useUserViewPopupStore();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [prevInputValue, setPrevInputValue] = useState<string>("");
  const [pressEnter, setPressEnter] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (useSelectedSpaceState) {
      const foundSpace = useSpaceState.find((space: SpaceData) => space.UID === useSelectedSpaceState.UID);

      if (foundSpace) {
        setSpaceName(foundSpace.space_name);
        setSpacePublic(foundSpace.space_public);
        setImageSource(foundSpace.space_profile_path ? foundSpace.space_profile_path : null);
      } else {
        toggleFnAndCancelAlert({
          isActOpen: true,
          content: "스페이스 정보를 찾을 수 없습니다.",
          fn: () => toggleSpaceSettingPopup(false),
        });
      }
    }
  }, [useSelectedSpaceState, useSpaceState]);

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
      alert("이미지 파일을 선택해 주세요. (JPEG, PNG, GIF 형식만 지원됩니다.)");
      e.target.value = "";
    }
  };

  const isValidImageType = (file: File) => {
    const validTypes = ["png", "jpg", "jpeg"];
    const extension = file.name.split(".").pop()?.toLowerCase();
    return extension ? validTypes.includes(extension) : false;
  };

  const handleUpdateSpace = () => {
    if (
      spaceName === useSelectedSpaceState.space_name &&
      spacePublic === useSelectedSpaceState.space_public &&
      (useImageCropState.imageSource === null || useImageCropState.imageSource! == "" || !useImageCropState.imageFile)
    ) {
      return toggleAlert("변경된 정보가 없습니다.");
    }

    const formData = new FormData();

    formData.append("spaceUid", JSON.stringify(useSelectedSpaceState.UID));

    if (spaceName !== useSelectedSpaceState.space_name) {
      formData.append("spaceName", JSON.stringify(spaceName));
    }
    if (spacePublic !== useSelectedSpaceState.space_public) {
      formData.append("spacePublic", JSON.stringify(spacePublic));
    }
    if (useImageCropState.imageSource !== useSelectedSpaceState.space_profile_path && useImageCropState.imageFile) {
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (pressEnter && inputValue === prevInputValue) {
      return;
    }
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (inputValue === "") {
      setPressEnter(false);
      setUseSpaceMemeberState(useSelectedSpaceState.UID, 0);
      setPrevInputValue(inputValue);
    } else {
      setPressEnter(true);
      setUseSpaceMemeberState(useSelectedSpaceState.UID, 0, inputValue);
      setPrevInputValue(inputValue);
    }
  };

  // 멤버 정보 검색
  const handleViewUser = async (userUid: string) => {
    const searchUser = await handleSearchUser(userUid);

    if (searchUser) {
      // 상세 정보 바인딩
      toggleUserViewPopup({ isActOpen: true, user: searchUser });
    } else {
      toggleAlert("비공개 사용자입니다.");
    }
  };

  const handleExit = (exitUid: string, senderUid: string, exitType: string) => {
    const formData = new FormData();

    formData.append("exitUid", exitUid);
    formData.append("senderUid", senderUid);
    formData.append("exitType", exitType);
    postLeaveNotification(formData);
  };

  const handleAuthority = async (uid: string) => {
    try {
      const res = await fetchApi({
        method: "POST",
        url: requests.POST_MANAGER,
        body: JSON.stringify({
          spaceUid: useSelectedSpaceState.UID,
          userUid: uid,
        }),
      });

      toggleAlert(res.message);

      if (res.resultCode) {
        fetchSpace();
        toggleSpaceSettingPopup(false);
      }
    } catch (error: any) {
      toggleAlert(error.message);
    }
  };

  const fetchMoreData = useCallback(async () => {
    if (loading) return;

    if (
      useSpaceSettingState.mode === "member" &&
      spaceMemeberPageInfo.currentPage !== spaceMemeberPageInfo.totalPages
    ) {
      setLoading(true);
      if (!pressEnter) {
        setUseSpaceMemeberState(useSelectedSpaceState.UID, spaceMemeberPageInfo.currentPage);
      } else {
        setUseSpaceMemeberState(useSelectedSpaceState.UID, spaceMemeberPageInfo.currentPage, prevInputValue);
      }

      setLoading(false);
    }
  }, [useSpaceMemeberState, spaceMemeberPageInfo, loading]);

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, clientHeight, scrollHeight } = contentRef.current;

        if (scrollHeight - scrollTop <= clientHeight) {
          fetchMoreData();
        }
      }
    };

    const refCurrent = contentRef.current;
    refCurrent?.addEventListener("scroll", handleScroll);

    return () => {
      refCurrent?.removeEventListener("scroll", handleScroll);
    };
  }, [fetchMoreData]);

  useEffect(() => {
    if (useSpaceSettingState.mode === "member") {
      setUseSpaceMemeberState(useSelectedSpaceState.UID, 0);
    }
  }, [useSpaceSettingState.mode]);

  // 이미지 정보 초기화
  useEffect(() => {
    const handleBeforeUnload = () => {
      reset();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      reset();
    };
  }, [reset]);

  return (
    <>
      <div className={styles.popup}>
        <div className={styles.dim} />
        <div className={styles.popupWrapper}>
          <div className={buttonStyles.tapButtonWrapper}>
            <button
              type="button"
              className={`button ${buttonStyles.tapButton} ${
                useSpaceSettingState.mode === "setting" ? buttonStyles.active : ""
              }`}
              onClick={() => handleMode("setting")}
            >
              설&nbsp;정
            </button>
            <button
              type="button"
              className={`button ${buttonStyles.tapButton} ${
                useSpaceSettingState.mode === "member" ? buttonStyles.active : ""
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
                  <div className={inputStyles.profile}>
                    {useImageCropState.imageSource !== null && useImageCropState.imageSource !== "" ? (
                      <img src={useImageCropState.imageSource as string} alt="profile" width={120} height={120} />
                    ) : (
                      <i className="normal">{useSelectedSpaceState.space_name.charAt(0)}</i>
                    )}
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
                </div>
                <div className={styles.settingMenu}>
                  <p>공개 설정</p>
                  <button
                    type="button"
                    className={`button ${buttonStyles.toggleButton} ${spacePublic ? "" : buttonStyles.disabled}`}
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
                  <p className="normal" style={{ fontSize: "12px", marginTop: "15px" }}>
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
                  <button type="button" className={`button ${buttonStyles.buttonBlue}`} onClick={handleUpdateSpace}>
                    저장
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.member}>
                <div className={inputStyles.inputText}>
                  <div className={inputStyles.inputCheckWrapper}>
                    <input
                      type="text"
                      className="input"
                      maxLength={100}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button type="button" className="button" onClick={handleSearch}>
                      검&nbsp;색
                    </button>
                  </div>
                </div>
                <div className={styles.searchResultWrapper} ref={contentRef}>
                  {useSpaceMemeberState && (
                    <>
                      <p>
                        {pressEnter && "검색 결과 : "} 총 {useSpaceMemeberState.length} 명
                      </p>
                      {pressEnter && useSpaceMemeberState.length < 1 ? (
                        <p className={styles.noSearchResults}>검색 결과가 없습니다.</p>
                      ) : (
                        <div className={styles.searchResultList}>
                          {useSpaceMemeberState.map((member: SpaceMemberData, index: number) => (
                            <div className={styles.searchResult} key={`search-space-${index}`}>
                              <button
                                type="button"
                                className={`button ${styles.goToSearchResult}`}
                                title={`${member.user_name} 님 정보`}
                                onClick={() => handleViewUser(member.UID)}
                              >
                                {member.roll === "manager" && <strong>M</strong>}
                                {member.user_profile_path && member.user_profile_path !== "" ? (
                                  <img src={member.user_profile_path} alt="" />
                                ) : (
                                  <i className="normal">{member.user_name.charAt(0)}</i>
                                )}
                                <em className="normal">{member.user_name}</em>
                              </button>
                              {member.UID !== useSelectedSpaceState.space_manager && (
                                <div className={styles.alertButton}>
                                  <button
                                    type="button"
                                    style={{ width: "80px", height: "38px" }}
                                    className={`button ${buttonStyles.buttonBorderBlue}`}
                                    onClick={() => {
                                      if (useSelectedSpaceState.UID) {
                                        toggleFnAndCancelAlert({
                                          isActOpen: true,
                                          content: `${member.user_name} 님을 내보내시겠습니까?`,
                                          fn: () => handleExit(member.UID, useSelectedSpaceState.UID, "user"),
                                        });
                                      }
                                    }}
                                  >
                                    내보내기
                                  </button>
                                  <button
                                    type="button"
                                    style={{ width: "80px", height: "38px" }}
                                    className={`button ${buttonStyles.buttonBlue}`}
                                    onClick={() => {
                                      if (useSelectedSpaceState.UID) {
                                        toggleFnAndCancelAlert({
                                          isActOpen: true,
                                          content: `매니저 권한을 ${member.user_name} 님에게 이관하시겠습니까?`,
                                          fn: () => handleAuthority(member.UID),
                                        });
                                      }
                                    }}
                                  >
                                    권한변경
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isLocked && <ImageCropInput />}
    </>
  );
}
