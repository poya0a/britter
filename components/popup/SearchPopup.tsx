import { ChangeEvent, KeyboardEvent, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSearchPopupStore } from "@stores/popup/useSearchPopupStore";
import { PostListData, SpaceListData, UserListData, useSearchStore } from "@stores/useSearchStore";
import styles from "@styles/components/_popup.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import inputStyles from "@styles/components/_input.module.scss";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { useSpaceStore } from "@stores/user/useSpaceStore";
import { useNotificationStore } from "@stores/user/useNotificationStore";
import { useInfoStore } from "@stores/user/useInfoStore";
import { usePostStore } from "@stores/user/usePostStore";
import { useAlertStore } from "@stores/popup/useAlertStore";
import { useUserViewPopupStore } from "@stores/popup/useUserViewPopupStore";

type RequestData = {
  uid?: string;
  recipient: string;
  sender: string;
  type: string;
  response?: boolean;
};

export default function SearchPopup() {
  const {
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const router = useRouter();
  const { useSearchState: popup, toggleSearchPopup } = useSearchPopupStore();
  const {
    useSearchState,
    setUseSearchState,
    setSearchPageNo,
    searchSpaceList,
    searchUserList,
    searchPostList,
    lastPage,
    handleSearchSpace,
    handleSearchUser,
  } = useSearchStore();
  const { useInfoState } = useInfoStore();
  const { useSelectedSpaceState, useSpaceMemeberState } = useSpaceStore();
  const { setPageSeq, setType } = usePostStore();
  const { postNotification, postLeaveNotification } = useNotificationStore();
  const { toggleAlert } = useAlertStore();
  const { toggleUserViewPopup } = useUserViewPopupStore();
  const [pressEnter, setPressEnter] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [prevInputValue, setPrevInputValue] = useState<string>("");

  const [searchLength, setSearchLength] = useState<number>(0);
  const [noSearchResults, setNoSearchResults] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    reset();
    setSearchLength(0);
    setNoSearchResults(false);
    setInputValue("");
    setUseSearchState({
      searchWord: "",
      spaceList: [],
      userList: [],
      postList: [],
    });
    clearErrors();
    toggleSearchPopup(false);
  };

  const handleMode = (mode: string) => {
    if (popup.mode !== mode) {
      toggleSearchPopup({ isActOpen: popup.isActOpen, mode: mode });
      setInputValue("");
      setPrevInputValue("");
      setUseSearchState({
        searchWord: "",
        spaceList: [],
        userList: [],
        postList: [],
      });
      setNoSearchResults(false);
      clearErrors();
      // callSearch(mode);
    }
  };

  const handleValue = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value) {
      clearErrors();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (pressEnter && inputValue === prevInputValue) {
      return;
    }
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    if (inputValue === "") {
      setNoSearchResults(false);
      setPrevInputValue(inputValue);
      return setError("value", {
        message: "검색어를 입력해 주세요.",
      });
    }
    setPressEnter(true);
    setPrevInputValue(inputValue);
    callSearch(popup.mode);
  };

  const callSearch = (mode: string) => {
    if (inputValue !== "") {
      setNoSearchResults(true);
      if (mode === "space") {
        setSearchPageNo({ space: 0 });
        searchSpaceList(inputValue);
      } else if (mode === "user") {
        setSearchPageNo({ user: 0 });
        searchUserList(inputValue);
      } else if (mode === "post") {
        setSearchPageNo({ post: 0 });
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
  }, [popup.mode, useSearchState.spaceList, useSearchState.userList, useSearchState.postList]);

  // 속한 스페이스거나 공개인 경우 페이지 이동
  const handleGoToSpace = async (spaceUid: string) => {
    // 현재 접속한 스페이스와 동일
    if (useSelectedSpaceState.UID === spaceUid) {
      handleClose();
      router.push("/");
      return;
    }
    const searchSpace = await handleSearchSpace(spaceUid);

    if (searchSpace) {
      handleClose();
      router.push("/");
    } else {
      toggleAlert("비공개 스페이스입니다.");
    }
  };

  // 사용자 정보 검색
  const handleViewUser = async (userUid: string) => {
    const searchUser = await handleSearchUser(userUid);

    if (searchUser) {
      // 상세 정보 바인딩
      toggleUserViewPopup({ isActOpen: true, user: searchUser });
    } else {
      toggleAlert("비공개 사용자입니다.");
    }
  };

  // 게시글의 스페이스에 속해있거나 공개인 경우 페이지 이동
  const handleGoToPost = async (spaceUid: string, postSeq: string) => {
    // 현재 접속한 스페이스와 동일
    if (useSelectedSpaceState.UID === spaceUid) {
      handleClose();
      setType("view");
      setPageSeq({ seq: postSeq, pSeq: "" });
      router.push(`/${useInfoState.user_id}`);
      return;
    }

    const searchSpace = await handleSearchSpace(spaceUid);

    if (searchSpace) {
      handleClose();
      setType("view");
      setPageSeq({ seq: postSeq, pSeq: "" });
      router.push(`/${useInfoState.user_id}`);
    } else {
      toggleAlert("비공개 스페이스입니다.");
    }
  };

  const handleRequest = (data: RequestData) => {
    const formData = new FormData();
    if (data.uid !== "" && data.uid) {
      formData.append("UID", data.uid);
      formData.append("response", JSON.stringify(data.response));
    }

    formData.append("senderUid", data.sender || "");
    formData.append("recipientUid", data.recipient);
    formData.append("notifyType", data.type);
    postNotification(formData);
  };

  const handleExit = (exitUid: string, senderUid: string, exitType: string) => {
    const formData = new FormData();

    formData.append("exitUid", exitUid);
    formData.append("senderUid", senderUid);
    formData.append("exitType", exitType);
    postLeaveNotification(formData);
  };

  return (
    <div className={styles.popup}>
      <div className={styles.dim} />
      <div className={styles.popupWrapper}>
        <button type="button" className={`button ${buttonStyles.closeButton}`} title="닫 기" onClick={handleClose}>
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
                onKeyDown={handleKeyDown}
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
            render={({ message }) => <p className={inputStyles.errorMessage}>{message}</p>}
          />
        </div>

        <div className={buttonStyles.tapLineButtonWrapper}>
          <button
            type="button"
            className={`button ${buttonStyles.tapLineButton} ${popup.mode === "space" ? buttonStyles.active : ""}`}
            style={{ width: "33.333%" }}
            onClick={() => handleMode("space")}
          >
            스페이스
          </button>
          <button
            type="button"
            className={`button ${buttonStyles.tapLineButton} ${popup.mode === "user" ? buttonStyles.active : ""}`}
            style={{ width: "33.333%" }}
            onClick={() => handleMode("user")}
          >
            사용자
          </button>
          <button
            type="button"
            className={`button ${buttonStyles.tapLineButton} ${popup.mode === "post" ? buttonStyles.active : ""}`}
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
                  useSearchState.spaceList.map((space: SpaceListData, index: number) => {
                    const spaceInfo = space.space_users?.find((user) => user.includes(useInfoState.UID));
                    const isSpaceInvited = space.notify && space.notify.notifyType === "invite";
                    const isSpaceRequested = space.notify && space.notify.notifyType === "participation";
                    const requestData = (uid?: string, response?: boolean) => {
                      const data: RequestData = {
                        uid: uid,
                        recipient: space.UID,
                        sender: useInfoState.UID,
                        type: "space",
                        response: response,
                      };

                      handleRequest(data);
                    };
                    return (
                      <div className={styles.searchResult} key={`search-space-${index}`}>
                        <button
                          type="button"
                          className={`button ${styles.goToSearchResult}`}
                          title={`${space.space_name} 스페이스 이동`}
                          onClick={() => handleGoToSpace(space.UID)}
                        >
                          {space.space_profile_path && space.space_profile_path !== "" ? (
                            <img src={space.space_profile_path} alt="profile" width={30} height={30} />
                          ) : (
                            <i className="normal">{space.space_name.charAt(0)}</i>
                          )}

                          <em className="normal">{space.space_name}</em>
                        </button>
                        {space.UID && !spaceInfo ? (
                          <>
                            {isSpaceInvited ? (
                              <>
                                <button
                                  type="button"
                                  style={{ width: "100px", height: "38px" }}
                                  className={`button ${buttonStyles.buttonBlue}`}
                                  onClick={() => requestData(space.notify?.notifyUID, false)}
                                >
                                  초대거절
                                </button>

                                <button
                                  type="button"
                                  style={{
                                    width: "100px",
                                    height: "38px",
                                    marginLeft: "10px",
                                  }}
                                  className={`button ${buttonStyles.buttonBorderBlue}`}
                                  onClick={() => requestData(space.notify?.notifyUID, true)}
                                >
                                  초대수락
                                </button>
                              </>
                            ) : isSpaceRequested ? (
                              <button
                                type="button"
                                style={{ width: "80px", height: "38px" }}
                                className={`button ${buttonStyles.buttonBlue}`}
                                onClick={() => requestData(space.notify?.notifyUID, false)}
                              >
                                참여취소
                              </button>
                            ) : (
                              <button
                                type="button"
                                style={{ width: "80px", height: "38px" }}
                                className={`button ${buttonStyles.buttonBorderBlue}`}
                                onClick={() => requestData("", true)}
                              >
                                참&nbsp;여
                              </button>
                            )}
                          </>
                        ) : (
                          useInfoState.UID !== space.space_manager && (
                            <button
                              type="button"
                              style={{ width: "80px", height: "38px" }}
                              className={`button ${buttonStyles.buttonBlue}`}
                              onClick={() => handleExit(space.UID, useInfoState.UID, "space")}
                            >
                              나가기
                            </button>
                          )
                        )}
                      </div>
                    );
                  })}
                {popup.mode === "user" &&
                  useSearchState.userList &&
                  useSearchState.userList.map((user: UserListData, index: number) => {
                    const isSpaceMember = useSpaceMemeberState.find((mem) => mem.UID === user.UID);

                    const isUserInvited = user.notify && user.notify.notifyType === "invite";
                    const isUserRequested = user.notify && user.notify.notifyType === "participation";

                    const requestData = (uid?: string, response?: boolean) => {
                      const data: RequestData = {
                        uid: uid,
                        recipient: user.UID,
                        sender: useSelectedSpaceState.UID || "",
                        type: "user",
                        response: response,
                      };

                      handleRequest(data);
                    };
                    return (
                      <div className={styles.searchResult} key={`search-space-${index}`}>
                        <button
                          type="button"
                          key={`search-user-${index}`}
                          className={`button ${styles.goToSearchResult}`}
                          title={`${user.user_id} 님 정보`}
                          onClick={() => handleViewUser(user.UID)}
                        >
                          {user.user_profile_path && user.user_profile_path !== "" ? (
                            <img src={user.user_profile_path} alt="profile" width={30} height={30} />
                          ) : (
                            <i className="normal">{user.user_name.charAt(0)}</i>
                          )}
                          <div>
                            <p className="normal">{user.user_id}</p>
                            <p className="normal">{user.user_name}</p>
                          </div>
                        </button>
                        {user.UID &&
                          user.UID !== useInfoState.UID &&
                          useInfoState.UID === useSelectedSpaceState.space_manager &&
                          (isSpaceMember ? (
                            <button
                              type="button"
                              style={{ width: "80px", height: "38px" }}
                              className={`button ${buttonStyles.buttonBlue}`}
                              onClick={() => handleExit(user.UID, useSelectedSpaceState.UID, "user")}
                            >
                              내보내기
                            </button>
                          ) : isUserInvited ? (
                            <button
                              type="button"
                              style={{ width: "80px", height: "38px" }}
                              className={`button ${buttonStyles.buttonBlue}`}
                              onClick={() => requestData(user.notify?.notifyUID, false)}
                            >
                              초대취소
                            </button>
                          ) : isUserRequested ? (
                            <>
                              <button
                                type="button"
                                style={{ width: "100px", height: "38px" }}
                                className={`button ${buttonStyles.buttonBlue}`}
                                onClick={() => requestData(user.notify?.notifyUID, false)}
                              >
                                요청거절
                              </button>
                              <button
                                type="button"
                                style={{
                                  width: "100px",
                                  height: "38px",
                                  marginLeft: "10px",
                                }}
                                className={`button ${buttonStyles.buttonBorderBlue}`}
                                onClick={() => requestData(user.notify?.notifyUID, true)}
                              >
                                요청수락
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              style={{ width: "80px", height: "38px" }}
                              className={`button ${buttonStyles.buttonBorderBlue}`}
                              onClick={() => requestData("", true)}
                            >
                              초&nbsp;대
                            </button>
                          ))}
                      </div>
                    );
                  })}
                {popup.mode === "post" &&
                  useSearchState.postList &&
                  useSearchState.postList.map((post: PostListData, index: number) => (
                    <div className={styles.searchPost} key={`search-post-${index}`}>
                      <button
                        type="button"
                        key={`search-user-${index}`}
                        className={`button ${styles.goToSearchPost}`}
                        title={`${post.title} 포스트 이동`}
                        onClick={() => handleGoToPost(post.space_uid, post.seq)}
                      >
                        <p className={styles.postTitle}>{post.title}</p>
                        <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: post.content }}></div>
                      </button>
                    </div>
                  ))}
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
