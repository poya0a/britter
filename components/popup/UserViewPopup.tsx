import { useUserViewPopupStore } from "@stores/popup/useUserViewPopupStore";
import { useInfoStore } from "@stores/user/useInfoStore";
import { useMessagePopupStore } from "@stores/popup/useMessagePopupStore";
import { useUserSettingPopupStore } from "@stores/popup/useUserSettingPopupStore";
import styles from "@styles/components/_popup.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import inputStyles from "@styles/components/_input.module.scss";
import Image from "next/image";

export default function UserViewPopup() {
  const { useUserViewPopupState, toggleUserViewPopup } =
    useUserViewPopupStore();
  const { toggleUserSettingPopup } = useUserSettingPopupStore();
  const { useInfoState } = useInfoStore();
  const { toggleMessagePopup } = useMessagePopupStore();

  return (
    <div className={styles.popup}>
      <div
        className={styles.dim}
        onClick={() => toggleUserViewPopup({ isActOpen: false })}
      />
      <div className={styles.popupWrapper}>
        <div className={styles.profile}>
          <div className={styles.settingMenu}>
            <div className={inputStyles.profile}>
              <Image
                src={useUserViewPopupState.user?.user_profile_path as string}
                alt="profile"
                width={120}
                height={120}
              />
            </div>
          </div>
          <h1>{useUserViewPopupState.user?.user_id}</h1>
          <div className={styles.profileItem}>
            <strong>이름</strong>
            <p>{useUserViewPopupState.user?.user_name}</p>
          </div>
          <div className={styles.profileItem}>
            <strong>전화번호</strong>
            <p>{useUserViewPopupState.user?.user_hp}</p>
          </div>
          {useUserViewPopupState.user?.user_email && (
            <div className={styles.profileItem}>
              <strong>이메일</strong>
              <p>{useUserViewPopupState.user?.user_email}</p>
            </div>
          )}
          {useUserViewPopupState.user?.user_birth && (
            <div className={styles.profileItem}>
              <strong>생년월일</strong>
              <p>{useUserViewPopupState.user?.user_birth}</p>
            </div>
          )}
          {(useUserViewPopupState.user?.status_emoji ||
            useUserViewPopupState.user?.status_message) && (
            <div className={styles.profileItem}>
              <strong>상태</strong>
              <p>{useUserViewPopupState.user?.status_emoji}</p>
              <p>{useUserViewPopupState.user?.status_message}</p>
            </div>
          )}
        </div>
        <div className={styles.profileButtonWrapper}>
          <button
            type="button"
            className={`button ${buttonStyles.buttonBorderBlue}`}
            onClick={() => {
              if (useUserViewPopupState.user) {
                // 메시지 보내기
                toggleMessagePopup({
                  isActOpen: true,
                  recipientUid: useUserViewPopupState.user?.UID,
                  recipientName: useUserViewPopupState.user?.user_name,
                });
              }
            }}
          >
            메시지
          </button>

          {useInfoState.UID === useUserViewPopupState.user?.UID ? (
            <button
              type="button"
              className={`button ${buttonStyles.buttonBlue}`}
              onClick={() => {
                toggleUserViewPopup({ isActOpen: false });
                toggleUserSettingPopup(true);
              }}
            >
              정보 수정
            </button>
          ) : (
            <button
              type="button"
              className={`button ${buttonStyles.buttonBlue}`}
              onClick={() => toggleUserViewPopup({ isActOpen: false })}
            >
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
