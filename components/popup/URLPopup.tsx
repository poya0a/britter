import { KeyboardEvent, useState } from "react";
import { useURLPopup } from "@hooks/popup/useURLPopup";
import styles from "@styles/components/_popup.module.scss";
import inputStyles from "@styles/components/_input.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";

export default function URLPopup() {
  const { toggleURLPopup } = useURLPopup();
  const [URLValue, setURLValue] = useState<string>("");
  const [labelValue, setLabelValue] = useState<string>("");
  const [notURL, setNotURL] = useState<boolean>(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLinkSave();
    }
  };

  const handleLinkSave = () => {
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?" + // 프로토콜 (선택)
        "((([a-zA-Z0-9\\-]+\\.)+[a-zA-Z]{2,})|" + // 도메인명
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // IP 주소 (IPv4)
        "(\\:\\d+)?(\\/[-a-zA-Z0-9%_.~+]*)*" + // 포트와 경로
        "(\\?[;&a-zA-Z0-9%_.~+=-]*)?" + // 쿼리 문자열 (선택)
        "(\\#[-a-zA-Z0-9_]*)?$", // 해시 (선택)
      "i"
    );
    if (!urlPattern.test(URLValue)) {
      return setNotURL(true);
    }

    toggleURLPopup({ URL: URLValue, label: labelValue });
  };

  return (
    <div className={styles.popup}>
      <div
        className={styles.dim}
        onClick={() => toggleURLPopup({ URL: null, label: null })}
      />
      <div className={styles.popupWrapper}>
        <h1>URL</h1>
        <div className={inputStyles.inputText}>
          <label>URL 주소</label>
          <input
            type="text"
            className="input"
            maxLength={100}
            value={URLValue}
            onChange={(e) => {
              setNotURL(false);
              setURLValue(e.target.value);
              setLabelValue(e.target.value);
            }}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className={inputStyles.inputText}>
          <label>URL 연결 문구</label>
          <input
            type="text"
            className="input"
            maxLength={30}
            value={labelValue}
            onChange={(e) => {
              setLabelValue(e.target.value);
            }}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div style={{ height: "20px" }} />
        <button
          type="button"
          className={`button ${buttonStyles.buttonBlue}`}
          onClick={handleLinkSave}
        >
          확인
        </button>
      </div>
      {notURL && <p>URL 형식이 올바르지 않습니다. 다시 입력해 주세요.</p>}
    </div>
  );
}
