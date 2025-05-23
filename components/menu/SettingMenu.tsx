import styles from "@styles/components/_menu.module.scss";
import { useSettingMenuStore } from "@stores/menu/useSettingMenuStore";
import { useUserSettingPopupStore } from "@stores/popup/useUserSettingPopupStore";
import { SpaceData, useSpaceStore } from "@stores/user/useSpaceStore";
import { useCreatePopupStore } from "@stores/popup/useCreatePopupStore";
import { useInfoStore } from "@stores/user/useInfoStore";
import { useAlertStore } from "@stores/popup/useAlertStore";
import { useRouter } from "next/navigation";
import { usePostStore } from "@stores/user/usePostStore";
import storage from "@fetch/auth/storage";

export default function SettingMenu() {
  const router = useRouter();
  const { useSettingMenuState, toggleSettingMenu } = useSettingMenuStore();
  const { toggleUserSettingPopup } = useUserSettingPopupStore();
  const { useInfoState } = useInfoStore();
  const { useSpaceState, useSelectedSpaceState, setUseSelectedSpaceState } = useSpaceStore();
  const { setPageSeq } = usePostStore();
  const { toggleAlert } = useAlertStore();
  const { toggleCreatePopup } = useCreatePopupStore();

  const handleCreate = () => {
    if (useInfoState.user_level === 1 && useSpaceState.length >= 3) {
      return toggleAlert("생성 및 참여할 수 있는 최대 갯수는 3개입니다.");
    }
    toggleCreatePopup({ isActOpen: true, mode: "create" });
  };

  const handleSetSpace = (space: SpaceData) => {
    storage.setSpaceUid(space.UID);
    setUseSelectedSpaceState(space);
    router.push("/");
    toggleSettingMenu(false);
    setPageSeq({ seq: "", pSeq: "" });
  };

  const handleNotService = () => {
    toggleAlert("서비스 준비 중입니다.");
  };

  return (
    <div
      className={styles.settingMenu}
      style={{
        top: useSettingMenuState.position.y + "px",
        left: useSettingMenuState.position.x + "px",
      }}
      data-ignore-outside-click
    >
      <div className={styles.spaceList}>
        {useSpaceState.map((space: SpaceData, idx: number) => (
          <button
            type="button"
            className={`button ${styles.space} ${space.UID === useSelectedSpaceState.UID && styles.active}`}
            key={`space-${idx}`}
            onClick={() => handleSetSpace(space)}
          >
            <div className={styles.spaceProfile}>
              {space.space_profile_path ? (
                <img src={space.space_profile_path} alt="profile" width={30} height={30} />
              ) : (
                <i className="normal">{space.space_name.charAt(0)}</i>
              )}
            </div>
            <div className={styles.spaceInfo}>
              {space.space_name}
              <i className="normal">{space.space_users ? space.space_users.length + 1 : 1} 명의 멤버</i>
              {space.UID === useSelectedSpaceState.UID && <img src="/images/check.svg" alt="connect space" />}
            </div>
          </button>
        ))}
      </div>
      <button type="button" className="button" onClick={() => toggleUserSettingPopup(true)}>
        개인 정보 수정
      </button>
      <button type="button" className="button" onClick={handleCreate}>
        스페이스 생성
      </button>
      <div className={styles.border} />
      <button type="button" className="button" onClick={handleNotService}>
        앱 설치
      </button>
    </div>
  );
}
