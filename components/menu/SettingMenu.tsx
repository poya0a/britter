import styles from "@styles/components/_menu.module.scss";
import { useSettingMenu } from "@hooks/menu/useSettingMenu";
import { SpaceData, useSpace } from "@hooks/user/useSpace";
import { useCreatePopup } from "@hooks/popup/useCreatePopup";
import { useInfo } from "@hooks/user/useInfo";
import { useAlert } from "@hooks/popup/useAlert";
import { useRouter } from "next/navigation";
import { usePost } from "@hooks/usePost";
import storage from "@fetch/auth/storage";
import Image from "next/image";

export default function SettingMenu() {
  const router = useRouter();
  const { useSettingMenuState, toggleSettingMenu } = useSettingMenu();
  const { useInfoState } = useInfo();
  const { useSpaceState, selectedSpace } = useSpace();
  const { setPageSeq } = usePost();
  const { toggleAlert } = useAlert();
  const { toggleCreatePopup } = useCreatePopup();

  const handleCreateOrJoin = () => {
    if (useInfoState.user_level === 1 && useSpaceState.length >= 3) {
      return toggleAlert("생성 및 참여할 수 있는 최대 갯수는 3개입니다.");
    }
    toggleCreatePopup({ isActOpen: true, mode: "create" });
  };

  const handleSetSpace = (uid: string) => {
    storage.setSpaceUid(uid);
    router.push("/");
    toggleSettingMenu(false);
    setPageSeq({ seq: "", pSeq: "" });
  };

  return (
    <div
      className={styles.settingMenu}
      style={{
        top: useSettingMenuState.position.y + "px",
        left: useSettingMenuState.position.x + "px",
      }}
    >
      <div className={styles.spaceList}>
        {useSpaceState.map((space: SpaceData, idx: number) => (
          <button
            type="button"
            className={`button ${styles.space} ${
              space.UID === selectedSpace?.UID && styles.active
            }`}
            key={`space-${idx}`}
            onClick={() => handleSetSpace(space.UID)}
          >
            <div className={styles.spaceProfile}>
              {space.space_profile_path ? (
                <Image
                  src={space.space_profile_path}
                  alt="profile"
                  width={30}
                  height={30}
                />
              ) : (
                // <img src={space.space_profile_path} alt="" />
                <i className="normal">{space.space_name.charAt(0)}</i>
              )}
            </div>
            <div className={styles.spaceInfo}>
              {space.space_name}
              <i className="normal">{space.space_users.length + 1} 명의 멤버</i>
              {space.UID === selectedSpace?.UID && (
                <img src="/images/check.svg" alt="connect space" />
              )}
            </div>
          </button>
        ))}
      </div>
      <button type="button" className="button">
        개인 정보 수정
      </button>
      <button type="button" className="button" onClick={handleCreateOrJoin}>
        스페이스 생성 및 참여
      </button>
      <div className={styles.border} />
      <button type="button" className="button">
        앱 설치
      </button>
    </div>
  );
}
