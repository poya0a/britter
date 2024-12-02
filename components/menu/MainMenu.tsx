"use client";
import { useRef, useEffect, useState } from "react";
import styles from "@styles/components/_menu.module.scss";
import { useMainMenuWidth } from "@hooks/menu/useMainMenuWidth";
import { useRouter } from "next/navigation";
import storage from "@fetch/auth/storage";
import { useRouteAlert } from "@hooks/popup/useRouteAlert";
import { PostListData, usePost } from "@hooks/usePost";
import { useInfo } from "@hooks/user/useInfo";
import { useAlert } from "@hooks/popup/useAlert";
import { useSearchPopup } from "@hooks/popup/useSearchPopup";
import { useSettingMenu } from "@hooks/menu/useSettingMenu";
import { useSpace } from "@hooks/user/useSpace";
import { useNotification } from "@/hooks/useNotification";
import { useSpaceSettingPopup } from "@hooks/popup/useSpaceSettingPopup";
import Image from "next/image";

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
  const { usePostListState, pageSeq, setPageSeq, setType } = usePost();
  const { useNotificationState, postNotification, postLeaveNotification } =
    useNotification();
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

  const renderSubPages = (subPages: PostListData[], depth: number) => {
    if (!subPages || subPages.length === 0) {
      return null;
    }

    return (
      <div style={{ paddingLeft: depth * 5 + "px" }}>
        <ul className={`list ${styles.pageList}`}>
          {subPages.map((post: PostListData, idx: number) => (
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
                        (sub: PostListData) => sub.p_seq === pageSeq.pSeq
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

  const handleExit = (spaceUid: string) => {
    const formData = new FormData();
    formData.append("exitUid", spaceUid);
    formData.append("senderUid", useInfoState.UID);
    formData.append("exitType", "space");
    postLeaveNotification(formData);
  };

  const handleRequest = (
    spaceUid: string,
    notifyUID?: string,
    response?: boolean
  ) => {
    const maxSpace = useInfoState.user_level === 1 && useSpaceState.length > 2;
    if (maxSpace) {
      return toggleAlert("최대 참여할 수 있는 스페이스는 3개입니다.");
    }
    const formData = new FormData();
    if (notifyUID) {
      formData.append("UID", notifyUID);
      formData.append("response", JSON.stringify(response));
    }
    formData.append("senderUid", useInfoState.UID);
    formData.append("recipientUid", spaceUid);
    formData.append("notifyType", "space");
    postNotification(formData);
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
                <Image
                  src={useInfoState.user_profile_path}
                  alt="profile"
                  width={30}
                  height={30}
                />
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
          {selectedSpace &&
            (useSpaceState
              .map((space) => space.UID)
              .includes(selectedSpace.UID) ? (
              selectedSpace.space_manager === useInfoState.UID ? (
                <button
                  type="button"
                  className={`button ${styles.mainMenuDefault}`}
                  onClick={() =>
                    toggleSpaceSettingPopup({
                      isActOpen: true,
                      mode: "setting",
                    })
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
                  <em
                    className="normal"
                    onClick={() => handleExit(selectedSpace.UID)}
                  >
                    스페이스 나가기
                  </em>
                </button>
              )
            ) : useNotificationState.filter(
                (notify) =>
                  notify.sender_uid === useInfoState.UID &&
                  notify.notify_type === "space"
              )[0]?.UID ? (
              <button
                type="button"
                className={`button ${styles.mainMenuDefault}`}
                style={{ lineHeight: "20px" }}
                onClick={() => {
                  const notifyUid = useNotificationState.filter(
                    (notify) =>
                      notify.sender_uid === useInfoState.UID &&
                      notify.notify_type === "space"
                  )[0].UID;
                  handleRequest(selectedSpace.UID, notifyUid, false);
                }}
              >
                <img src="/images/icon/emoji_sad.svg" alt="" />
                <em className="normal">스페이스 참여 취소</em>
              </button>
            ) : useNotificationState.filter(
                (notify) =>
                  notify.recipient_uid === useInfoState.UID &&
                  notify.notify_type === "user"
              )[0]?.UID ? (
              <>
                <button
                  type="button"
                  className={`button ${styles.mainMenuDefault}`}
                  style={{ lineHeight: "20px" }}
                  onClick={() => {
                    const notifyUid = useNotificationState.filter(
                      (notify) =>
                        notify.recipient_uid === useInfoState.UID &&
                        notify.notify_type === "user"
                    )[0].UID;
                    handleRequest(selectedSpace.UID, notifyUid, true);
                  }}
                >
                  <img src="/images/icon/emoji_smile.svg" alt="" />
                  <em className="normal">스페이스 초대 수락</em>
                </button>
                <button
                  type="button"
                  className={`button ${styles.mainMenuDefault}`}
                  style={{ lineHeight: "20px" }}
                  onClick={() => {
                    const notifyUid = useNotificationState.filter(
                      (notify) =>
                        notify.recipient_uid === useInfoState.UID &&
                        notify.notify_type === "user"
                    )[0].UID;
                    handleRequest(selectedSpace.UID, notifyUid, false);
                  }}
                >
                  <img src="/images/icon/emoji_sad.svg" alt="" />
                  <em className="normal">스페이스 초대 거절</em>
                </button>
              </>
            ) : (
              <button
                type="button"
                className={`button ${styles.mainMenuDefault}`}
                style={{ lineHeight: "20px" }}
                onClick={() => handleRequest(selectedSpace.UID)}
              >
                <img src="/images/icon/emoji_smile.svg" alt="" />
                <em className="normal">스페이스 참여</em>
              </button>
            ))}
        </div>
        <div className={styles.pageMenu}>
          <h6 className={styles.pageMenuName}>
            {selectedSpace?.space_name}
            &nbsp;스페이스
          </h6>
          <ul className={`list ${styles.pageList} ${styles.pageListWrap}`}>
            {usePostListState.map((post: PostListData, idx: number) => (
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
