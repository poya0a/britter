import { useCreatePopup } from "@hooks/popup/useCreatePopup";
import styles from "@styles/components/_popup.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import inputStyles from "@styles/components/_input.module.scss";
import { ChangeEvent, useState } from "react";
import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import { useToast } from "@hooks/popup/useToast";
import { useSpace } from "@hooks/user/useSpace";
import { useSearch, SpaceListData } from "@hooks/useSearch";

export default function CreatePopup() {
  const {
    useCreateState,
    toggleCreatePopup,
    // updateSpaceRequest,
  } = useCreatePopup();
  const { createSpace } = useSpace();
  const { useSearchState, searchSpaceList } = useSearch();
  const [inputValue, setInputValue] = useState<{
    create: string;
    search: string;
  }>({ create: "", search: "" });
  const [noSearchResults, setNoSearchResults] = useState<boolean>(false);
  const { setToast } = useToast();
  const {
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const handleMode = (mode: string) => {
    if (useCreateState.mode !== mode) {
      toggleCreatePopup({ isActOpen: useCreateState.isActOpen, mode: mode });
    }

    clearErrors();
  };

  const handleClose = () => {
    reset();
    toggleCreatePopup(false);
  };

  const handleValue = (e: ChangeEvent<HTMLInputElement>) => {
    if (useCreateState.mode === "create") {
      setInputValue((prevState) => ({
        ...prevState,
        create: e.target.value,
      }));
    } else {
      setInputValue((prevState) => ({
        ...prevState,
        search: e.target.value,
      }));
    }

    clearErrors();
  };

  const handleCreate = () => {
    if (inputValue.create === "") {
      return setError("value", {
        message: "생성할 스페이스 이름을 입력해 주세요.",
      });
    }
    createSpace(inputValue.create);
  };

  const handleSearch = () => {
    if (inputValue.search === "") {
      setNoSearchResults(false);
      return setError("value", {
        message: "검색어를 입력해 주세요.",
      });
    }
    searchSpaceList(inputValue.search);
    setNoSearchResults(true);
  };

  const handleGoToSpace = (spaceUid: string) => {};

  const handleRequest = (spaceUid: string, request?: boolean) => {
    if (request) {
      return setToast("이미 참여 신청한 스페이스입니다.");
    }
    // updateSpaceRequest(spaceUid);
    setToast("참여 신청 완료하였습니다.");
  };

  return (
    <div className={styles.popup}>
      <div className={styles.dim} />
      <div className={styles.popupWrapper}>
        <div className={buttonStyles.tapButtonWrapper}>
          <button
            type="button"
            className={`button ${buttonStyles.tapButton} ${
              useCreateState.mode === "create" ? buttonStyles.active : ""
            }`}
            onClick={() => handleMode("create")}
          >
            생&nbsp;성
          </button>
          <button
            type="button"
            className={`button ${buttonStyles.tapButton} ${
              useCreateState.mode === "search" ? buttonStyles.active : ""
            }`}
            onClick={() => handleMode("search")}
          >
            검&nbsp;색
          </button>
        </div>
        <button
          type="button"
          className={`button ${buttonStyles.closeButton}`}
          title="닫 기"
          onClick={handleClose}
        >
          <img src="/images/icon/close.svg" alt="close" />
        </button>
        <div className={buttonStyles.tapWrapper}>
          <div className={inputStyles.inputText}>
            <div className={inputStyles.inputCheckWrapper}>
              <input
                type="text"
                className="input"
                maxLength={100}
                value={
                  useCreateState.mode === "create"
                    ? inputValue.create
                    : inputValue.search
                }
                onChange={handleValue}
              />
              <button
                type="button"
                className="button"
                onClick={
                  useCreateState.mode === "create" ? handleCreate : handleSearch
                }
              >
                {useCreateState.mode === "create" ? "생 성" : "검 색"}
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
          {useCreateState.mode === "search" && (
            <div className={styles.searchResultWrapper}>
              {useSearchState.spaceList && noSearchResults && (
                <>
                  {<p>검색 결과 : 총 {useSearchState.spaceList.length} 건</p>}
                  {useSearchState.spaceList.length > 0 ? (
                    <div className={styles.searchResultList}>
                      {useSearchState.spaceList.map(
                        (space: SpaceListData, index: number) => (
                          <div
                            className={styles.searchResult}
                            key={`search-space-${index}`}
                          >
                            <button
                              type="button"
                              className={`button ${styles.goToSearchResult}`}
                              title={`${space.space_name} 스페이스 이동`}
                              onClick={() => handleGoToSpace(space.UID)}
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

                            <button
                              type="button"
                              style={{ width: "80px", height: "38px" }}
                              className={`button ${
                                space.space_Request
                                  ? buttonStyles.buttonBorderBlue
                                  : buttonStyles.buttonBlue
                              }`}
                              onClick={() =>
                                handleRequest(space.UID, space.space_Request)
                              }
                            >
                              참&nbsp;여
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className={styles.noSearchResults}>
                      검색 결과가 없습니다.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
