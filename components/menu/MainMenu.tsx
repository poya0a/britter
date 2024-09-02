"use client";
import { useRef, useEffect, useState } from "react";
import styles from "@styles/components/_menu.module.scss";
import { useMainMenuWidth } from "@hooks/menu/useMainMenuWidth";
import { useRouter } from "next/navigation";
import storage from "@fetch/auth/storage";
import { useRouteAlert } from "@hooks/popup/useRouteAlert";
import { PostData, usePost } from "@hooks/usePost";
import { useInfo } from "@hooks/user/useInfo";
import { useAlert } from "@hooks/popup/useAlert";
import { useSearchPopup } from "@hooks/popup/useSearchPopup";
import { useSettingMenu } from "@hooks/menu/useSettingMenu";
import { useSpace } from "@hooks/user/useSpace";
import { useSpaceSettingPopup } from "@hooks/popup/useSpaceSettingPopup";

export default function MainMenu() {
  const { useMainMenuWidthState, handleMainMenuWidth } = useMainMenuWidth();
  const nodeRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const router = useRouter();
  const { toggleAlert } = useAlert();
  const { toggleRouteAlert } = useRouteAlert();
  const { toggleSearchPopup } = useSearchPopup();
  const { useInfoState } = useInfo();
  const { useSpaceState, selectedSpace } = useSpace();
  const { usePostState, pageSeq, setPageSeq, setType } = usePost();
  const [expandedPosts, setExpandedPosts] = useState<string[]>([]);
  const { useSettingMenuState, toggleSettingMenu } = useSettingMenu();
  const { toggleSpaceSettingPopup } = useSpaceSettingPopup();
  let startX: number, startWidth: number;

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    startX = "clientX" in e ? e.clientX : e.touches[0].clientX;
    startWidth = nodeRef.current!.offsetWidth;
    dragging.current = true;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleMouseMove);
    document.addEventListener("touchend", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!dragging.current) return;
    const currentX = "clientX" in e ? e.clientX : e.touches[0].clientX;
    const dx = currentX - startX + 230;
    const newWidth = startWidth + dx;
    handleMainMenuWidth(
      Math.min(Math.max(newWidth, 200), window.innerWidth / 2)
    );
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  useEffect(() => {
    dragging.current = false;

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.removeEventListener("touchmove", handleMouseMove);
    document.removeEventListener("touchend", handleMouseUp);
  }, []);

  // 페이지 생성
  const handleCreate = (seq?: string) => {
    toggleSettingMenu(false);
    if (!useInfoState.user_id) {
      return toggleRouteAlert({
        isActOpen: true,
        content: "로그아웃되었습니다. 다시 로그인해 주세요.",
        route: "/login",
      });
    } else {
      setPageSeq({ seq: "", pSeq: seq ? seq : "" });
      setType("create");
      router.push(`/${useInfoState.user_id}`);
    }
  };

  const renderSubPages = (subPages: PostData[], depth: number) => {
    if (!subPages || subPages.length === 0) {
      return null;
    }

    return (
      <div style={{ paddingLeft: depth * 5 + "px" }}>
        <ul className={`list ${styles.pageList}`}>
          {subPages.map((post: PostData, idx: number) => (
            <li
              className={`list ${styles.pageItem}`}
              key={`post-sub${depth}-${idx}`}
            >
              <div className={`button ${styles.pageWrapper}`}>
                <button
                  type="button"
                  className={`button ${styles.pageButton} 
                  ${
                    pageSeq.seq === post.seq ||
                    (pageSeq.seq === "" &&
                      post.subPost?.find(
                        (sub: PostData) => sub.p_seq === pageSeq.pSeq
                      ))
                      ? styles.active
                      : ""
                  }`}
                  onClick={() => handleView(post.seq)}
                >
                  <img
                    src={
                      post.subPost && post.subPost.length > 0
                        ? "/images/icon/folder.svg"
                        : "/images/icon/file.svg"
                    }
                    alt=""
                  />
                  <em className="normal">{post.title}</em>
                </button>
                <button
                  type="button"
                  className={`button ${styles.pageMoreButton}`}
                >
                  <img
                    src="/images/icon/more.svg"
                    alt="삭제, 복제 등"
                    title="삭제, 복제 등"
                  />
                </button>
                <button
                  type="button"
                  className={`button ${styles.pageAddOneDepth}`}
                  onClick={() => handleCreate(post.seq)}
                >
                  <img
                    src="/images/icon/add.svg"
                    alt="하위 페이지 추가"
                    title="하위 페이지 추가"
                  />
                </button>
              </div>
              {post.subPost &&
                post.subPost.length > 0 &&
                expandedPosts.includes(post.seq) &&
                renderSubPages(post.subPost, depth + 1)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPosts = storage.getExpandedPosts();
      if (storedPosts) {
        setExpandedPosts(JSON.parse(storedPosts));
      }
    }
  }, []);

  // 페이지 이동
  const handleView = (seq: string) => {
    toggleSettingMenu(false);
    const newExpandedPosts = expandedPosts.includes(seq)
      ? expandedPosts.filter((item) => item !== seq)
      : [...expandedPosts, seq];

    setExpandedPosts(newExpandedPosts);
    storage.setExpandedPosts(JSON.stringify(newExpandedPosts));

    setPageSeq({ seq: seq, pSeq: "" });

    setType("view");
    router.push(`/${useInfoState.user_id}`);
  };

  const handleSetting = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggleSettingMenu({
      isActOpen: true,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleHome = () => {
    router.push("/");
    toggleSettingMenu(false);
  };

  const handleSearch = () => {
    toggleSearchPopup({ isActOpen: true, mode: "space" });
    toggleSettingMenu(false);
  };

  const notService = () => {
    toggleAlert("서비스 준비 중입니다.");
    toggleSettingMenu(false);
  };

  return (
    <div
      style={{ width: `${useMainMenuWidthState}px` }}
      className={styles.mainMenu}
    >
      <div className={styles.mainMenuWrapper}>
        <div className={styles.mainMenuFixed}>
          <div className={styles.pageNameButtonWrapper}>
            <button
              type="button"
              className={`button ${styles.pageNameButton} ${
                useSettingMenuState.isActOpen ? styles.active : ""
              }`}
              onClick={handleSetting}
            >
              {useInfoState.user_profile_path ? (
                <img src={useInfoState.user_profile_path} alt="" />
              ) : (
                <i className="normal">
                  {useInfoState.user_nick_name.charAt(0)}
                </i>
              )}

              <em className="normal">{useInfoState.user_nick_name}</em>
            </button>
            <button
              type="button"
              className={`button ${styles.pageAddButton}`}
              onClick={() => handleCreate()}
            >
              <img src="/images/icon/write.svg" alt="" />
            </button>
          </div>
          <button
            type="button"
            className={`button ${styles.mainMenuDefault}`}
            onClick={handleHome}
          >
            <img src="/images/icon/home.svg" alt="" />
            <em className="normal">홈</em>
          </button>
          <button
            type="button"
            className={`button ${styles.mainMenuDefault}`}
            onClick={handleSearch}
          >
            <img src="/images/icon/search.svg" alt="" />
            <em className="normal">검색</em>
          </button>
          <button
            type="button"
            className={`button ${styles.mainMenuDefault}`}
            onClick={notService}
          >
            <img src="/images/icon/inbox.svg" alt="" />
            <em className="normal">수신함</em>
          </button>
          {useSpaceState.find((space) => space.UID === selectedSpace)
            ?.space_manager === useInfoState.UID ? (
            <button
              type="button"
              className={`button ${styles.mainMenuDefault}`}
              onClick={() =>
                toggleSpaceSettingPopup({ isActOpen: true, mode: "setting" })
              }
            >
              <img src="/images/icon/settings.svg" alt="" />
              <em className="normal">설정과 멤버</em>
            </button>
          ) : (
            <button
              type="button"
              className={`button ${styles.mainMenuDefault}`}
            >
              <img src="/images/icon/exit.svg" alt="" />
              <em className="normal">스페이스 나가기</em>
            </button>
          )}
        </div>
        <div className={styles.pageMenu}>
          <h6 className={styles.pageMenuName}>
            {
              useSpaceState.find((space) => space.UID === selectedSpace)
                ?.space_name
            }
            &nbsp;스페이스
          </h6>
          <ul className={`list ${styles.pageList} ${styles.pageListWrap}`}>
            {usePostState.map((post: PostData, idx: number) => (
              <li className={`list ${styles.pageItem}`} key={`post-${idx}`}>
                <div className={styles.pageWrapper}>
                  <button
                    type="button"
                    className={`button ${styles.pageButton} ${
                      pageSeq.seq === post.seq && pageSeq.pSeq === ""
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => handleView(post.seq)}
                  >
                    <img
                      src={
                        post.subPost && post.subPost.length > 0
                          ? "/images/icon/folder.svg"
                          : "/images/icon/file.svg"
                      }
                      alt=""
                    />
                    <em className="normal">{post.title}</em>
                  </button>
                  <button
                    type="button"
                    className={`button ${styles.pageMoreButton}`}
                  >
                    <img
                      src="/images/icon/more.svg"
                      alt="삭제, 복제 등"
                      title="삭제, 복제 등"
                    />
                  </button>
                  <button
                    type="button"
                    className={`button ${styles.pageAddOneDepth}`}
                    onClick={() => handleCreate(post.seq)}
                  >
                    <img
                      src="/images/icon/add.svg"
                      alt="하위 페이지 추가"
                      title="하위 페이지 추가"
                    />
                  </button>
                </div>
                {post.subPost &&
                  post.subPost.length > 0 &&
                  expandedPosts.includes(post.seq) &&
                  renderSubPages(post.subPost, 1)}
              </li>
            ))}
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
