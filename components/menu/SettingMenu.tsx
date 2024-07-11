import styles from "@styles/components/_menu.module.scss";
import { useSettingMenu } from "@/hooks/menu/useSettingMenu";

export default function SettingMenu() {
  const { useSettingMenuState } = useSettingMenu();

  return (
    <div
      className={styles.settingMenu}
      style={{
        top: useSettingMenuState.position.y + "px",
        left: useSettingMenuState.position.x + "px",
      }}
    >
      <div className={styles.spaceList}>
        <button
          type="button"
          className={`button ${styles.space} ${styles.active}`}
        >
          do
          <i className="normal">{} 명의 멤버</i>
          <img src="/images/check.svg" alt="connect space" />
        </button>
        <button type="button" className={`button ${styles.space}`}>
          space01
          <i className="normal">{} 명의 멤버</i>
        </button>
        <button type="button" className={`button ${styles.space}`}>
          space02
          <i className="normal">{} 명의 멤버</i>
        </button>
      </div>
      <button type="button" className="button">
        개인 정보 수정
      </button>
      <button type="button" className="button">
        스페이스 생성 및 참여
      </button>
      <div className={styles.border} />
      <button type="button" className="button">
        앱 설치
      </button>
    </div>
  );
}
