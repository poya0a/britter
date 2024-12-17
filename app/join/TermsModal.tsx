import { useTermsPopupStore } from "./store/useTermsPopupStore";
import { TermsData, useTermsStore } from "./store/useTermsStore";
import popupStyles from "@styles/components/_popup.module.scss";
import inputStyles from "@styles/components/_input.module.scss";
import styles from "./page.module.scss";

function ModalTerms() {
  const {
    useTermsState,
    selectedTerms,
    selectTerms,
    toggleCheck,
    toggleCheckAll,
  } = useTermsStore();

  const { toggleTermsPopup } = useTermsPopupStore();
  const checked = useTermsState.every((term: TermsData) => term.checked);

  const handleCheckedAll = () => {
    toggleTermsPopup(false);
    toggleCheckAll(true);
  };

  return (
    <div className={popupStyles.modal}>
      <div className={popupStyles.modalWrapper}>
        <div className={styles.termsWrapper}>
          <h1>이용약관 동의</h1>
          <h3>
            서비스 이용을 위해
            <br />
            <em className="normal">이용약관 동의</em>가 필요합니다.
          </h3>
          <div className={styles.terms}>
            <div className={inputStyles.inputCheckAll}>
              <input
                id="all"
                type="checkbox"
                className="input"
                checked={checked}
                onChange={() => toggleCheckAll(!checked)}
              />
              <label htmlFor="all">
                전체 동의<span>(선택항목 포함)</span>
              </label>
            </div>
            <div style={{ paddingLeft: "30px" }}>
              <div className={inputStyles.inputCheck}>
                {useTermsState &&
                  useTermsState.map((term: TermsData, idx: number) => (
                    <div
                      className={inputStyles.inputCheckWrapper}
                      key={`term_${idx}`}
                    >
                      <input
                        type="checkbox"
                        className="input"
                        id={term.seq.toString()}
                        checked={term.checked ?? false}
                        onChange={() => toggleCheck(term.seq)}
                      />
                      <button
                        type="button"
                        className={`button ${inputStyles.inputCheckButton}`}
                        onClick={() => {
                          selectTerms(term.seq);
                        }}
                      >
                        {term.title}
                        <span>{term.required ? "(필수) " : "(선택) "}</span>
                      </button>
                      <div
                        className={[
                          styles.termsContents,
                          selectedTerms === term.seq ? styles.active : "",
                        ].join(" ")}
                      >
                        <p>{term.content}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div className={popupStyles.buttonFooterTerms}>
          <button
            type="button"
            className={`button ${popupStyles.buttonTerms}`}
            onClick={() => toggleTermsPopup(false)}
          >
            닫 기
          </button>
          <button
            type="button"
            className={`button ${popupStyles.buttonTerms}`}
            onClick={handleCheckedAll}
          >
            모두 동의
          </button>
        </div>
      </div>
      <div
        className={popupStyles.dim}
        onClick={() => toggleTermsPopup(false)}
      />
    </div>
  );
}

export default ModalTerms;
