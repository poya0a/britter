import { ChangeEvent, useState, useEffect, useRef } from "react";
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
import { Space } from "@/server/entities/Space.entity";

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
  const [inputValue, setInputValue] = useState<string>("");
  const [searchLength, setSearchLength] = useState<number>(0);
  const [noSearchResults, setNoSearchResults] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollEvent, setScrollEvent] = useState(false);

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

  const handleScroll = () => {
    if (contentRef.current) {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const contentBottom = contentRef.current.getBoundingClientRect().bottom;

      if (scrollPosition + windowHeight >= contentBottom - 10) {
        setScrollEvent(true);
      } else {
        setScrollEvent(false);
      }
    }
  };

  // useEffect(() => {
  //   console.log(contentRef);
  //   window.addEventListener("scroll", handleScroll);
  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, [contentRef]);

  useEffect(() => {
    if (scrollEvent && useSearchState.searchWord) {
      console.log(useSearchState.searchWord);
      setNoSearchResults(true);
      if (popup.mode === "space" && !lastPage.space) {
        return searchSpaceList(useSearchState.searchWord);
      } else if (popup.mode === "user" && !lastPage.user) {
        return searchUserList(useSearchState.searchWord);
      } else if (popup.mode === "post" && !lastPage.post) {
        return searchPostList(useSearchState.searchWord);
      }
    }
  }, [scrollEvent]);

  useEffect(() => {
    if (popup.mode === "space") {
      setSearchLength(useSearchState.spaceList?.length ?? 0);
      window.addEventListener("scroll", handleScroll);
    } else if (popup.mode === "user") {
      setSearchLength(useSearchState.userList?.length ?? 0);
      window.addEventListener("scroll", handleScroll);
    } else if (popup.mode === "post") {
      setSearchLength(useSearchState.postList?.length ?? 0);
    }
  }, [
    popup.mode,
    useSearchState.spaceList,
    useSearchState.userList,
    useSearchState.postList,
  ]);

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
          {searchLength < 1 && noSearchResults ? (
            <p className={styles.noSearchResults}>검색 결과가 없습니다.</p>
          ) : searchLength > 0 && noSearchResults ? (
            <div
              className={styles.searchResultList}
              style={{ marginTop: searchLength < 1 ? "0" : "16px" }}
              ref={contentRef}
            >
              {popup.mode === "space" &&
                useSearchState.spaceList &&
                useSearchState.spaceList.map(
                  (space: SpaceListData, index: number) => (
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
                          <i className="normal">{space.space_name.charAt(0)}</i>
                        )}

                        <em className="normal">{space.space_name}</em>
                      </button>

                      <button
                        type="button"
                        style={{ width: "80px", height: "38px" }}
                        className={`button ${
                          space.space_Request
                            ? buttonStyles.buttonBorderBlue
                            : buttonStyles.buttonBlue
                        }`}
                        // onClick={() =>
                        //   // handleRequest(space.UID, space.space_Request)
                        // }
                      >
                        참&nbsp;여
                      </button>
                    </div>
                  )
                )}
              {popup.mode === "user" &&
                useSearchState.userList &&
                useSearchState.userList.map(
                  (user: UserListData, index: number) => (
                    <div
                      className={styles.searchResult}
                      key={`search-space-${index}`}
                    >
                      <button
                        type="button"
                        key={`search-user-${index}`}
                        className={`button ${styles.goToSearchResult}`}
                        // title={`${space.space_name} 스페이스 이동`}
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
                      {user.UID && (
                        <button
                          type="button"
                          style={{ width: "80px", height: "38px" }}
                          className={buttonStyles.buttonBorderBlue}
                        >
                          초&nbsp;대
                        </button>
                      )}
                    </div>
                  )
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
                        // title={`${space.space_name} 스페이스 이동`}
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
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
}
