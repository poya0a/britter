"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./page.module.scss";

export default function MainMenu() {
  const [width, setWidth] = useState(240);
  const nodeRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  let startX: number, startWidth: number;

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    startX = "clientX" in e ? e.clientX : e.touches[0].clientX;
    startWidth = nodeRef.current!.offsetWidth;
    dragging.current = true;
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!dragging.current) return;
    const currentX = "clientX" in e ? e.clientX : e.touches[0].clientX;
    const dx = currentX - startX + 230;
    const newWidth = startWidth + dx;
    setWidth(Math.min(Math.max(newWidth, 200), window.innerWidth / 2));
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleMouseMove);
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  return (
    <div style={{ width: `${width}px` }} className={styles.mainMenu}>
      <div className={styles.mainMenuWrapper}>
        <div className={styles.mainMenuFixed}>
          <div className={styles.pageNameButtonWrapper}>
            <button className={`button ${styles.pageNameButton}`}>
              {/* <img src="" alt="" /> */}
              <i className="normal">B</i>
              <em className="normal">BRIT</em>
            </button>
            <button className={`button ${styles.pageAddButton}`}>
              <img src="/images/icon/write.svg" alt="" />
            </button>
          </div>
          <button className={`button ${styles.mainMenuDefault}`}>
            <img src="/images/icon/home.svg" alt="" />
            <em className="normal">홈</em>
          </button>
          <button className={`button ${styles.mainMenuDefault}`}>
            <img src="/images/icon/search.svg" alt="" />
            <em className="normal">검색</em>
          </button>
          <button className={`button ${styles.mainMenuDefault}`}>
            <img src="/images/icon/inbox.png" alt="" />
            <em className="normal">수신함</em>
          </button>
        </div>

        <div className={styles.pageMenu}>
          <h6 className={styles.pageMenuName}>페이지</h6>
          <ul className={`list ${styles.pageList}`}>
            <li className={`list ${styles.pageItem}`}>
              <div className={styles.pageWrapper}>
                <button className={`button ${styles.pageButton}`}>
                  <img src="/images/icon/page.svg" alt="" />
                  <em className="normal">page1</em>
                </button>
                <button className={`button ${styles.pageMoreButton}`}>
                  <img
                    src="/images/icon/more.svg"
                    alt="삭제, 복제 등"
                    title="삭제, 복제 등"
                  />
                </button>
                <button className={`button ${styles.pageAddOneDepth}`}>
                  <img
                    src="/images/icon/add.svg"
                    alt="하위 페이지 추가"
                    title="하위 페이지 추가"
                  />
                </button>
              </div>

              <div className={styles.subPageMenu}>
                <ul className={`list ${styles.subPageList}`}>
                  <li className={`list ${styles.subPageItem}`}>
                    <div className={`button ${styles.sebPageWrapper}`}>
                      <button className={`button ${styles.pageButton}`}>
                        <img src="/images/icon/page_edit.svg" alt="" />
                        <em className="normal">page1</em>
                      </button>
                      <button
                        className={`button ${styles.pageMoreButton}`}
                      ></button>
                      <button
                        className={`button ${styles.pageAddOneDepth}`}
                      ></button>
                    </div>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div
        ref={nodeRef}
        className={styles.mainMenuDragBar}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      />
    </div>
  );
}
