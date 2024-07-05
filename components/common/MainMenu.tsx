"use client";
import { useRef, useEffect, useState } from "react";
import styles from "@styles/components/_common.module.scss";
import { useMainMenuWidth } from "@hooks/useMainMenuWidth";
import { useRouter } from "next/navigation";
import storage from "@fetch/auth/storage";
import { useRouteAlert } from "@/hooks/popup/useRouteAlert";
import { PostData, usePost } from "@hooks/usePost";
import { useInfo } from "@hooks/useInfo";
import { useAlert } from "@/hooks/popup/useAlert";

export default function MainMenu() {
  const { useMainMenuWidthState, handleMainMenuWidth } = useMainMenuWidth();
  const nodeRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const router = useRouter();
  const { toggleAlert } = useAlert();
  const { toggleRouteAlert } = useRouteAlert();
  const { usePostState } = usePost();
  const { useInfoState } = useInfo();
  const [expandedPosts, setExpandedPosts] = useState<string[]>(() => {
    const storedPosts = storage.getExpandedPosts();
    return storedPosts ? JSON.parse(storedPosts) : [];
  });
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

  const handleCreate = (pageId?: string) => {
    if (!useInfoState.user_id) {
      return toggleRouteAlert({
        isActOpen: true,
        content: "로그아웃되었습니다. 다시 로그인해 주세요.",
        route: "/login",
      });
    } else {
      let path = `/${useInfoState.user_id}`;
      if (pageId) path += `?p_page=${pageId}`;
      router.push(path);
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
                  className={`button ${styles.pageButton}`}
                  onClick={() => handleClick(post.seq)}
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

  const handleClick = (seq: string) => {
    const newExpandedPosts = expandedPosts.includes(seq)
      ? expandedPosts.filter((item) => item !== seq)
      : [...expandedPosts, seq];

    setExpandedPosts(newExpandedPosts);
    storage.setExpandedPosts(JSON.stringify(newExpandedPosts));
    router.push(`/${useInfoState.user_id}/${seq}`);
  };

  const notService = () => {
    toggleAlert("서비스 준비 중입니다.");
  };

  return (
    <div
      style={{ width: `${useMainMenuWidthState}px` }}
      className={styles.mainMenu}
    >
      <div className={styles.mainMenuWrapper}>
        <div className={styles.mainMenuFixed}>
          <div className={styles.pageNameButtonWrapper}>
            <button type="button" className={`button ${styles.pageNameButton}`}>
              {useInfoState.user_profile_path ? (
                <img src={useInfoState.user_profile_path} alt="" />
              ) : (
                <i className="normal">{useInfoState.user_name.charAt(0)}</i>
              )}

              <em className="normal">{useInfoState.user_name}</em>
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
            onClick={() => router.push("/")}
          >
            <img src="/images/icon/home.svg" alt="" />
            <em className="normal">홈</em>
          </button>
          <button type="button" className={`button ${styles.mainMenuDefault}`}>
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
        </div>

        <div className={styles.pageMenu}>
          <h6 className={styles.pageMenuName}>페이지</h6>
          <ul className={`list ${styles.pageList}`}>
            {usePostState.map((post: PostData, idx: number) => (
              <li className={`list ${styles.pageItem}`} key={`post-${idx}`}>
                <div className={styles.pageWrapper}>
                  <button
                    type="button"
                    className={`button ${styles.pageButton}`}
                    onClick={() => handleClick(post.seq)}
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
