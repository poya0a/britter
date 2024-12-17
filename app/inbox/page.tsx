"use client";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from "react";
import styles from "./page.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import inputStyles from "@styles/components/_input.module.scss";
import { useNotificationStore } from "@stores/user/useNotificationStore";
import { useMessageStore } from "@stores/user/useMessageStore";
import { useInfoStore } from "@stores/user/useInfoStore";
import MessageViewPopup from "@components/popup/MessageViewPopup";
import { useFnAndCancelAlertStore } from "@stores/popup/useFnAndCancelAlertStore";

export default function Page() {
  const [activeTab, setActiveTab] = useState<string>("notify");
  const {
    useNotificationState,
    pageNo: notifyPage,
    lastPage: notifyLastPage,
    fetchNotification,
  } = useNotificationStore();
  const {
    useMessageListState,
    type,
    pageNo: messagePage,
    lastPage: messageLastPage,
    searchWord: messageSearchWord,
    fetchMessageList,
    fetchMessage,
    handleReadMessage,
    handleDeleteMessage,
  } = useMessageStore();
  const { useInfoState } = useInfoStore();
  const [messagePopupIsActOpen, setMessagePopupIsActOpen] =
    useState<boolean>(false);
  const [messagePopup, setMessagePopup] = useState<{
    type: string;
    uid: string;
    handleClose: Function;
  }>({
    type: "",
    uid: "",
    handleClose: () => {},
  });
  const { toggleFnAndCancelAlert } = useFnAndCancelAlertStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [pressEnter, setPressEnter] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [prevInputValue, setPrevInputValue] = useState<string>("");

  useEffect(() => {
    fetchNotification(0);
  }, []);

  const handleSelectTab = (tabName: string) => {
    if (activeTab === tabName) return;
    if (tabName === "receivedMessage" || tabName === "sentMessage") {
      fetchMessageList({
        typeName: tabName,
        page: 0,
        searchWord: "",
      });
    } else {
      fetchNotification(0);
    }
    setInputValue("");
    setPrevInputValue("");
    setActiveTab(tabName);
  };

  const handleMessageViewPopup = (messageUid: string, uid: string) => {
    setMessagePopupIsActOpen(true);
    fetchMessage(messageUid);
    setMessagePopup({
      type: activeTab,
      uid: uid,
      handleClose: () => setMessagePopupIsActOpen(false),
    });
  };

  const fetchMoreData = useCallback(async () => {
    if (loading) return;

    if (activeTab === "notify") {
      if (!notifyLastPage) {
        setLoading(true);
        fetchNotification(notifyPage);
        setLoading(false);
      }
    } else if (activeTab === type) {
      if (!messageLastPage) {
        setLoading(true);
        fetchMessageList({
          typeName: activeTab,
          page: messagePage,
          searchWord: messageSearchWord,
        });
        setLoading(false);
      }
    }
  }, [
    useNotificationState,
    useMessageListState,
    notifyLastPage,
    messageLastPage,
    loading,
  ]);

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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (pressEnter && inputValue === prevInputValue) {
      return;
    }
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    fetchMessageList({
      typeName: activeTab,
      page: 0,
      searchWord: inputValue,
    });
    setPressEnter(true);
    setPrevInputValue(inputValue);
  };

  return (
    <>
      <div className={styles.inboxWrapper}>
        <div className={buttonStyles.tapVerticalButtonWrapper}>
          <button
            type="button"
            className={`button ${buttonStyles.tapButton} ${
              activeTab === "notify" ? buttonStyles.active : ""
            }`}
            onClick={() => handleSelectTab("notify")}
          >
            알&nbsp;림
          </button>

          <button
            type="button"
            className={`button ${buttonStyles.tapButton} ${
              activeTab === "receivedMessage" ? buttonStyles.active : ""
            }`}
            onClick={() => {
              handleSelectTab("receivedMessage");
            }}
          >
            받은&nbsp;메시지
          </button>
          <button
            type="button"
            className={`button ${buttonStyles.tapButton} ${
              activeTab === "sentMessage" ? buttonStyles.active : ""
            }`}
            onClick={() => {
              handleSelectTab("sentMessage");
            }}
          >
            보낸&nbsp;메시지
          </button>
        </div>
        <div className={styles.tapWrapper}>
          {activeTab === "notify" ? (
            <div className={styles.notifyWrapper}>
              <p className={styles.notifyInfo}>
                알림은 30일 경과 후 자동 삭제됩니다.
              </p>
              <p className={styles.notifyLength}>
                총 {useNotificationState.length} 건
              </p>
              <div className={styles.scrollWrapper} ref={contentRef}>
                {useNotificationState &&
                  useNotificationState.map((notify, index) => (
                    <div className={styles.notify} key={`notify-${index}`}>
                      <div>
                        {notify.name ? notify.name : "알 수 없음"}&nbsp;
                        {notify.sender_uid === useInfoState.UID
                          ? notify.notify_type === "space"
                            ? "스페이스에 참여 요청하였습니다."
                            : notify.notify_type === "memberIn"
                            ? "스페이스에 참여하였습니다."
                            : notify.notify_type === "memberOut"
                            ? "스페이스에서 퇴장했습니다."
                            : notify.notify_type === "refusal"
                            ? "스페이스 참여 요청을 거절하였습니다."
                            : notify.notify_type === "acceptance"
                            ? "스페이스 참여 요청을 수락하였습니다."
                            : ""
                          : notify.notify_type === "space"
                          ? "스페이스에서 초대를 요청했습니다."
                          : notify.notify_type === "user"
                          ? "님이 참여 요청하였습니다."
                          : notify.notify_type === "memberIn"
                          ? "님이 참여하였습니다."
                          : notify.notify_type === "memberOut"
                          ? "님이 퇴장했습니다."
                          : notify.notify_type === "refusal"
                          ? "님이 참여 요청을 거절하였습니다."
                          : notify.notify_type === "acceptance"
                          ? "님이 참여 요청을 수락하였습니다."
                          : ""}
                      </div>
                      <div>
                        {new Date(notify.create_date)
                          .toLocaleDateString("ko-KR")
                          .replace(/-/g, ".")
                          .slice(0, -1)}
                      </div>
                    </div>
                  ))}
              </div>
              {(!useNotificationState || useNotificationState.length < 1) && (
                <p className={styles.noResults}>알림이 없습니다.</p>
              )}
            </div>
          ) : (
            <div className={styles.messageWrapper}>
              <div className={styles.fixedTop}>
                <div className={inputStyles.inputText}>
                  <div className={inputStyles.inputCheckWrapper}>
                    <input
                      type="text"
                      className="input"
                      maxLength={50}
                      value={inputValue}
                      onKeyDown={handleKeyDown}
                      onChange={(e) => {
                        {
                          setInputValue(e.target.value);
                          setPressEnter(false);
                        }
                      }}
                      placeholder="메시지 내용을 검색하세요."
                    />
                    <button
                      type="submit"
                      className="button"
                      onClick={handleSearch}
                    >
                      검&nbsp;색
                    </button>
                  </div>
                </div>
                <p>총 {useMessageListState.length} 건</p>
              </div>
              <div className={styles.scrollWrapper} ref={contentRef}>
                {useMessageListState &&
                  useMessageListState.map((message, index) => {
                    return (
                      <div
                        className={`${styles.message} ${
                          message.confirm && styles.confirmedMessage
                        }`}
                        key={`message-${index}`}
                        onClick={() => {
                          handleMessageViewPopup(
                            message.UID,
                            activeTab === "receivedMessage"
                              ? message.sender_uid
                              : message.recipient_uid
                          );
                          // 안 읽은 받은 메시지만 읽음 처리 가능
                          if (
                            activeTab === "receivedMessage" &&
                            !message.confirm
                          ) {
                            handleReadMessage(message.UID);
                          }
                        }}
                      >
                        {activeTab !== "receivedMessage" && (
                          <button
                            type="button"
                            className={`button ${styles.closeButton}`}
                            title="삭 제"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFnAndCancelAlert({
                                isActOpen: true,
                                content: "삭제하시겠습니까?",
                                fn: () => {
                                  handleDeleteMessage(message.UID);
                                },
                              });
                            }}
                          >
                            <img src="/images/icon/close.svg" alt="close" />
                          </button>
                        )}
                        <h5>
                          {activeTab === "receivedMessage" ? "보낸" : "받은"}
                          &nbsp;사람
                        </h5>
                        <h5>{message.name ? message.name : "알 수 없음"}</h5>
                        <div>
                          <p>{message.message}</p>
                        </div>
                        <p>
                          {new Date(message.create_date)
                            .toLocaleDateString("ko-KR")
                            .replace(/-/g, ".")
                            .slice(0, -1)}
                        </p>
                      </div>
                    );
                  })}
              </div>
              {(!useMessageListState || useMessageListState.length < 1) && (
                <p className={styles.noResults}>
                  {pressEnter
                    ? "검색 결과가 없습니다."
                    : activeTab === "receivedMessage"
                    ? "받은 메시지가 없습니다."
                    : "보낸 메시지가 없습니다."}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      {messagePopupIsActOpen && <MessageViewPopup {...messagePopup} />}
    </>
  );
}
