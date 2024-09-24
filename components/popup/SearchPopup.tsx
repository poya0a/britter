import { ChangeEvent, useState, useEffect, useRef, useCallback } from "react";
import { useSearchPopup } from "@hooks/popup/useSearchPopup";
import {
  PostListData,
  SpaceListData,
  UserListData,
  useSearch,
} from "@hooks/useSearch";
import styles from "@styles/components/_popup.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import inputStyles from "@styles/components/_input.module.scss";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { useToast } from "@hooks/popup/useToast";
import { useSpace } from "@hooks/user/useSpace";
import { useNotification } from "@hooks/useNotification";
import { useInfo } from "@hooks/user/useInfo";

export default function SearchPopup() {
  const {
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const { useSearchState: popup, toggleSearchPopup } = useSearchPopup();
  const {
    useSearchState,
    setSearchPageNo,
    searchSpaceList,
    searchUserList,
    searchPostList,
    lastPage,
  } = useSearch();
  const { useInfoState } = useInfo();
  const { useSpaceState, selectedSpace, spaceMember } = useSpace();
  const { useNotificationState, postNotification } = useNotification();
  const [inputValue, setInputValue] = useState<string>("");
  const [searchLength, setSearchLength] = useState<number>(0);
  const [noSearchResults, setNoSearchResults] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const { setToast } = useToast();

  const handleClose = () => {
    reset();
    setSearchLength(0);
    setNoSearchResults(false);
    setInputValue("");
    clearErrors();
    toggleSearchPopup(false);
  };

  const handleMode = (mode: string) => {
    if (popup.mode !== mode) {
      toggleSearchPopup({ isActOpen: popup.isActOpen, mode: mode });
      callSearch(mode);
    }
  };

  const handleValue = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value) {
      clearErrors();
    }
  };

  const handleSearch = async () => {
    if (inputValue === "") {
      setNoSearchResults(false);
      return setError("value", {
        message: "검색어를 입력해 주세요.",
      });
    }
    callSearch(popup.mode);
  };

  const callSearch = (mode: string) => {
    if (inputValue !== "") {
      setNoSearchResults(true);
      if (mode === "space") {
        setSearchPageNo((prevState) => ({
          ...prevState,
          space: 0,
        }));
        searchSpaceList(inputValue);
      } else if (mode === "user") {
        setSearchPageNo((prevState) => ({
          ...prevState,
          user: 0,
        }));
        searchUserList(inputValue);
      } else if (mode === "post") {
        setSearchPageNo((prevState) => ({
          ...prevState,
          post: 0,
        }));
        searchPostList(inputValue);
      }
    }
  };

  const fetchMoreData = useCallback(async () => {
    if (loading || !useSearchState.searchWord) return;

    setNoSearchResults(true);

    if (popup.mode === "space" && !lastPage.space) {
      setLoading(true);
      searchSpaceList(useSearchState.searchWord);
      setLoading(false);
    } else if (popup.mode === "user" && !lastPage.user) {
      setLoading(true);
      searchUserList(useSearchState.searchWord);
      setLoading(false);
    } else if (popup.mode === "post" && !lastPage.post) {
      setLoading(true);
      searchPostList(useSearchState.searchWord);
      setLoading(false);
    }
  }, [useSearchState, lastPage, loading, popup.mode]);

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
    if (popup.mode === "space") {
      setSearchLength(useSearchState.spaceList?.length ?? 0);
    } else if (popup.mode === "user") {
      setSearchLength(useSearchState.userList?.length ?? 0);
    } else if (popup.mode === "post") {
      setSearchLength(useSearchState.postList?.length ?? 0);
    }
  }, [
    popup.mode,
    useSearchState.spaceList,
    useSearchState.userList,
    useSearchState.postList,
  ]);

  const handleGoToSpace = (spaceUid: string) => {};

  const getRequestUid = (senderUid: string, recipientUid: string): string => {
    const target = { recipient_uid: recipientUid, sender_uid: senderUid };
    const requestUid = useNotificationState.find(
      (notify) => JSON.stringify(notify) === JSON.stringify(target)
    )?.UID;

    return requestUid || "";
  };

  const handleRequest = (uid: string, type: string, response?: boolean) => {
    const formData = new FormData();
    const senderUid = type === "user" ? selectedSpace?.UID : useInfoState.UID;

    if (response) {
      const requestUid = getRequestUid(senderUid || "", uid);
      formData.append("UID", requestUid);
      formData.append("response", JSON.stringify(response));
    }

    formData.append("senderUid", senderUid || "");
    formData.append("recipientUid", uid);
    formData.append("notifyType", type);
    postNotification(formData);
  };

  return (
    <div className={styles.popup}>
      <div className={styles.dim} />
      <div className={styles.popupWrapper}>
        <button
          type="button"
          className={`button ${buttonStyles.closeButton}`}
          title="닫 기"
          onClick={handleClose}
        >
          <img src="/images/icon/close.svg" alt="close" />
        </button>

        <div className={styles.searchWrapper}>
          <div className={inputStyles.inputText}>
            <div className={inputStyles.inputCheckWrapper}>
              <input
                type="text"
                className="input"
                maxLength={50}
                value={inputValue}
                onChange={handleValue}
              />
              <button type="submit" className="button" onClick={handleSearch}>
                검&nbsp;색
              </button>
            </div>
          </div>
          <ErrorMessage
            errors={errors}
            name="value"
            render={({ message }) => (
              <p className={inputStyles.errorMessage}>{message}</p>
            )}
          />
        </div>

        <div className={buttonStyles.tapLineButtonWrapper}>
          <button
            type="button"
            className={`button ${buttonStyles.tapLineButton} ${
              popup.mode === "space" ? buttonStyles.active : ""
            }`}
            style={{ width: "33.333%" }}
            onClick={() => handleMode("space")}
          >
            스페이스
          </button>
          <button
            type="button"
            className={`button ${buttonStyles.tapLineButton} ${
              popup.mode === "user" ? buttonStyles.active : ""
            }`}
            style={{ width: "33.333%" }}
            onClick={() => handleMode("user")}
          >
            사용자
          </button>
          <button
            type="button"
            className={`button ${buttonStyles.tapLineButton} ${
              popup.mode === "post" ? buttonStyles.active : ""
            }`}
            style={{ width: "33.333%" }}
            onClick={() => handleMode("post")}
          >
            포스트
          </button>
        </div>

        <div className={styles.searchResultWrapper}>
          {noSearchResults && <p>검색 결과 : 총 {searchLength} 건</p>}
          <div className={styles.searchResultList} ref={contentRef}>
            {searchLength < 1 && noSearchResults ? (
              <p className={styles.noSearchResults}>검색 결과가 없습니다.</p>
            ) : searchLength > 0 && noSearchResults ? (
              <>
                {popup.mode === "space" &&
                  useSearchState.spaceList &&
                  useSearchState.spaceList.map(
                    (space: SpaceListData, index: number) => {
                      const spaceInfo = useSpaceState.find(
                        (spaceData) => spaceData.UID === space.UID
                      );
                      const isSpaceInvited = useNotificationState.find(
                        (notify) =>
                          notify.notify_type === "space" &&
                          notify.recipient_uid === useInfoState.UID &&
                          notify.sender_uid === space.space_manager
                      );
                      const isSpaceRequested = useNotificationState.find(
                        (notify) =>
                          notify.notify_type === "space" &&
                          notify.sender_uid === useInfoState.UID &&
                          notify.recipient_uid === space.space_manager
                      );

                      console.log(isSpaceRequested);
                      return (
                        <div
                          className={styles.searchResult}
                          key={`search-space-${index}`}
                        >
                          <button
                            type="button"
                            className={`button ${styles.goToSearchResult}`}
                            title={`${space.space_name} 스페이스 이동`}
                            // onClick={() => handleGoToSpace(space.UID)}
                          >
                            {space.space_profile_path &&
                            space.space_profile_path !== "" ? (
                              <img src={space.space_profile_path} alt="" />
                            ) : (
                              <i className="normal">
                                {space.space_name.charAt(0)}
                              </i>
                            )}

                            <em className="normal">{space.space_name}</em>
                          </button>
                          {space.UID && !spaceInfo ? (
                            <>
                              {isSpaceInvited ? (
                                <>
                                  <button
                                    type="button"
                                    style={{ width: "80px", height: "38px" }}
                                    className={buttonStyles.buttonBlue}
                                    onClick={() => {
                                      handleRequest(space.UID, "space", false);
                                    }}
                                  >
                                    초대거절
                                  </button>

                                  <button
                                    type="button"
                                    style={{ width: "80px", height: "38px" }}
                                    className={buttonStyles.buttonBorderBlue}
                                    onClick={() =>
                                      handleRequest(space.UID, "space", true)
                                    }
                                  >
                                    초대수락
                                  </button>
                                </>
                              ) : isSpaceRequested ? (
                                <button
                                  type="button"
                                  style={{ width: "80px", height: "38px" }}
                                  className={buttonStyles.buttonBlue}
                                  onClick={() =>
                                    handleRequest(space.UID, "space", false)
                                  }
                                >
                                  참여취소
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  style={{ width: "80px", height: "38px" }}
                                  className={buttonStyles.buttonBorderBlue}
                                  onClick={() =>
                                    handleRequest(space.UID, "space")
                                  }
                                >
                                  참&nbsp;여
                                </button>
                              )}
                            </>
                          ) : (
                            useInfoState.UID !==
                              selectedSpace?.space_manager && (
                              <button
                                type="button"
                                style={{ width: "80px", height: "38px" }}
                                className={buttonStyles.buttonBlue}
                                onClick={() =>
                                  handleRequest(space.UID, "space")
                                }
                              >
                                나가기
                              </button>
                            )
                          )}
                        </div>
                      );
                    }
                  )}
                {popup.mode === "user" &&
                  useSearchState.userList &&
                  useSearchState.userList.map(
                    (user: UserListData, index: number) => {
                      const isSpaceMember = spaceMember?.find(
                        (mem) => mem.UID === user.UID
                      );
                      const isUserInvited =
                        selectedSpace?.invite_users?.includes(user.UID);
                      const isUserRequested =
                        selectedSpace?.request_users?.includes(user.UID);
                      return (
                        <div
                          className={styles.searchResult}
                          key={`search-space-${index}`}
                        >
                          <button
                            type="button"
                            key={`search-user-${index}`}
                            className={`button ${styles.goToSearchResult}`}
                            title={`${user.user_id} 사용자 스페이스 이동`}
                          >
                            {user.user_profile_path &&
                            user.user_profile_path !== "" ? (
                              <img src={user.user_profile_path} alt="" />
                            ) : (
                              <i className="normal">
                                {user.user_nick_name.charAt(0)}
                              </i>
                            )}
                            <div>
                              <p className="normal">{user.user_id}</p>
                              <p className="normal">{user.user_nick_name}</p>
                            </div>
                          </button>
                          {user.UID &&
                            user.UID !== useInfoState.UID &&
                            useInfoState.UID === selectedSpace?.space_manager &&
                            (isSpaceMember ? (
                              <button
                                type="button"
                                style={{ width: "80px", height: "38px" }}
                                className={buttonStyles.buttonBlue}
                                onClick={() => handleRequest(user.UID, "user")}
                              >
                                내보내기
                              </button>
                            ) : isUserInvited ? (
                              <button
                                type="button"
                                style={{ width: "80px", height: "38px" }}
                                className={buttonStyles.buttonBlue}
                                onClick={() =>
                                  handleRequest(user.UID, "user", false)
                                }
                              >
                                초대취소
                              </button>
                            ) : isUserRequested ? (
                              <>
                                <button
                                  type="button"
                                  style={{ width: "80px", height: "38px" }}
                                  className={buttonStyles.buttonBlue}
                                  onClick={() =>
                                    handleRequest(user.UID, "user", false)
                                  }
                                >
                                  요청거절
                                </button>
                                <button
                                  type="button"
                                  style={{ width: "80px", height: "38px" }}
                                  className={buttonStyles.buttonBorderBlue}
                                  onClick={() =>
                                    handleRequest(user.UID, "user", true)
                                  }
                                >
                                  요청수락
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                style={{ width: "80px", height: "38px" }}
                                className={buttonStyles.buttonBorderBlue}
                                onClick={() => handleRequest(user.UID, "user")}
                              >
                                초&nbsp;대
                              </button>
                            ))}
                        </div>
                      );
                    }
                  )}
                {popup.mode === "post" &&
                  useSearchState.postList &&
                  useSearchState.postList.map(
                    (post: PostListData, index: number) => (
                      <div
                        className={styles.searchPost}
                        key={`search-post-${index}`}
                      >
                        <button
                          type="button"
                          key={`search-user-${index}`}
                          className={`button ${styles.goToSearchPost}`}
                          title={`${post.title} 포스트 이동`}
                        >
                          <p className={styles.postTitle}>{post.title}</p>
                          <div
                            className={styles.postContent}
                            dangerouslySetInnerHTML={{ __html: post.content }}
                          ></div>
                        </button>
                      </div>
                    )
                  )}
              </>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
