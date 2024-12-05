"use client";
import React, { useState } from "react";
import styles from "./page.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import { useNotification } from "@hooks/useNotification";
import { useMessage } from "@hooks/useMessage";
import { useInfo } from "@hooks/user/useInfo";
import MessageViewPopup from "@components/popup/MessageViewPopup";
import MessagePopup from "@components/popup/MessagePopup";
import Alert from "@components/popup/Alert";
import RoutAlert from "@components/popup/RouteAlert";
import FnAndCancelAlert from "@components/popup/FnAndCancelAlert";
import Toast from "@components/popup/Toast";
import { useAlert } from "@hooks/popup/useAlert";
import { useRouteAlert } from "@hooks/popup/useRouteAlert";
import { useFnAndCancelAlert } from "@hooks/popup/useFnAndCancelAlert";
import { useToast } from "@hooks/popup/useToast";
import { useMessagePopup } from "@hooks/popup/useMessagePopup";

export default function Page() {
  const [activeTab, setActiveTab] = useState<string>("notify");
  const { useNotificationState } = useNotification();
  const {
    useMessageListState,
    setType,
    fetchMessage,
    handleReadMessagee,
    handleDeleteMessage,
  } = useMessage();
  const { useInfoState } = useInfo();
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
  const { useAlertState } = useAlert();
  const { useRouteAlertState } = useRouteAlert();
  const { useFnAndCancelAlertState, toggleFnAndCancelAlert } =
    useFnAndCancelAlert();
  const { useToastState } = useToast();
  const { useMessagePopupState } = useMessagePopup();

  const handleMessageViewPopup = (messageUid: string, uid: string) => {
    setMessagePopupIsActOpen(true);
    fetchMessage(messageUid);
    setMessagePopup({
      type: activeTab,
      uid: uid,
      handleClose: () => setMessagePopupIsActOpen(false),
    });
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
            onClick={() => setActiveTab("notify")}
          >
            알&nbsp;림
          </button>

          <button
            type="button"
            className={`button ${buttonStyles.tapButton} ${
              activeTab === "receivedMessage" ? buttonStyles.active : ""
            }`}
            onClick={() => {
              setActiveTab("receivedMessage");
              setType("receivedMessage");
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
              setActiveTab("sentMessage");
              setType("sentMessage");
            }}
          >
            보낸&nbsp;메시지
          </button>
        </div>
        <div className={styles.tapWrapper}>
          {activeTab === "notify" ? (
            <div className={styles.notifyWrapper}>
              <p>알림은 30일 경과 후 자동 삭제됩니다.</p>
              {useNotificationState &&
                useNotificationState.map((notify, index) => (
                  <div className={styles.notify} key={`notify-${index}`}>
                    <div>
                      {notify.name}&nbsp;
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
          ) : (
            <div className={styles.messageWrapper}>
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
                          handleReadMessagee(message.UID);
                        }
                      }}
                    >
                      {activeTab !== "receivedMessage" && (
                        <button
                          type="button"
                          className={`button ${styles.closeButton}`}
                          title="닫 기"
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
                      <h5>{message.name}</h5>
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
              {(!useMessageListState || useMessageListState.length < 1) && (
                <p>
                  {activeTab === "receivedMessage" ? "보낸" : "받은"} 메시지가
                  없습니다.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      {messagePopupIsActOpen && <MessageViewPopup {...messagePopup} />}
      {useMessagePopupState.isActOpen && <MessagePopup />}
      {useAlertState.isActOpen && <Alert />}
      {useRouteAlertState.isActOpen && <RoutAlert />}
      {useFnAndCancelAlertState.isActOpen && <FnAndCancelAlert />}
      {useToastState.isActOpen && <Toast />}
    </>
  );
}
