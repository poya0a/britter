"use client";
import { useRef, useEffect, useState } from "react";
import styles from "@styles/components/_menu.module.scss";
import { useMainMenuWidth } from "@hooks/menu/useMainMenuWidth";
import { useRouter } from "next/navigation";
import storage from "@fetch/auth/storage";
import { useRouteAlert } from "@hooks/popup/useRouteAlert";
import { useFnAndCancelAlert } from "@hooks/popup/useFnAndCancelAlert";
import { PostListData, usePost } from "@hooks/user/usePost";
import { useInfo } from "@hooks/user/useInfo";
import { useAlert } from "@hooks/popup/useAlert";
import { useSearchPopup } from "@hooks/popup/useSearchPopup";
import { useSettingMenu } from "@hooks/menu/useSettingMenu";
import { useSpace } from "@hooks/user/useSpace";
import { useNotification } from "@hooks/user/useNotification";
import { useSpaceSettingPopup } from "@hooks/popup/useSpaceSettingPopup";
import { usePostFolderPopup } from "@hooks/popup/usePostFolderPopup";
import Image from "next/image";

export default function MainMenu() {
  const { useMainMenuWidthState, handleMainMenuWidth } = useMainMenuWidth();
  const nodeRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const router = useRouter();
  const { toggleAlert } = useAlert();
  const { toggleRouteAlert } = useRouteAlert();
  const { toggleFnAndCancelAlert } = useFnAndCancelAlert();
  const { toggleSearchPopup } = useSearchPopup();
  const { usePostFolderPopupState, togglePostFolderPopup } =
    usePostFolderPopup();
  const { useInfoState } = useInfo();
  const { useSpaceState, selectedSpace } = useSpace();
  const { usePostListState, pageSeq, setPageSeq, setType, deletePost } =
    usePost();
  const { postNotification, postLeaveNotification } = useNotification();
  const [expandedPosts, setExpandedPosts] = useState<string[]>([]);
  const otherMenuRef = useRef<HTMLButtonElement>(null);
  const settingMenuRef = useRef<HTMLButtonElement>(null);
  const [otherMenuPopup, setOtherMenuPopup] = useState<{
    top: number;
    left: number;
    seq: string | null;
  }>({
    top: 0,
    left: 0,
    seq: null,
  });
  const { useSettingMenuState, toggleSettingMenu } = useSettingMenu();
  const { toggleSpaceSettingPopup } = useSpaceSettingPopup();
  let startX: number, startWidth: number;

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
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

  // 기타 메뉴 클릭 이벤트
  const handleToggleOtherMenu = (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.TouchEvent<HTMLButtonElement>,
    seq: string
  ) => {
    const target = e.target as HTMLElement;
    const { top, left } = target.getBoundingClientRect();

    if (otherMenuPopup.seq === seq) {
      // 동일 버튼 클릭 시 토글
      setOtherMenuPopup({ top: 0, left: 0, seq: null });
    } else {
      setOtherMenuPopup({
        top: top + window.scrollY,
        left: left + window.scrollX,
        seq: seq,
      });
    }
  };

  // 페이지 생성
  const handleCreate = (seq?: string) => {
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
              <div
                className={`button ${styles.pageWrapper} ${
                  otherMenuPopup.seq === post.seq ? styles.active : ""
                }`}
              >
                <button
                  type="button"
                  className={`button ${styles.pageButton} 
                  ${
                    pageSeq.seq === post.seq ||
                    (pageSeq.seq === "" &&
                      post.subPost?.find(
                        (sub: PostListData) => sub.p_seq === pageSeq.pSeq
                      )) ||
                    otherMenuPopup.seq === post.seq
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
                  className={`button ${styles.pageMoreButton}${
                    otherMenuPopup.seq === post.seq ? styles.active : ""
                  }`}
                  ref={otherMenuRef}
                  onClick={(e) => handleToggleOtherMenu(e, post.seq)}
                >
                  <img
                    src="/images/icon/more.svg"
                    alt="이동, 복사, 삭제 등"
                    title="이동, 복사, 삭제 등"
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

  const handleSearch = () => {
    toggleSearchPopup({ isActOpen: true, mode: "space" });
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

  const handleMoveAndCopyPost = (type: string) => {
    togglePostFolderPopup({
      isActOpen: true,
      spaceUid: selectedSpace?.UID || "",
      type: type,
      seq: otherMenuPopup.seq || "",
    });
  };

  const handleDeletePost = () => {
    let content = "삭제하시겠습니까?";

    const subPost = usePostListState.find(
      (post) => post.seq === otherMenuPopup.seq
    )?.subPost;
    if (subPost && subPost.length > 0) {
      content = "하위 게시글도 함께 삭제됩니다. 삭제하시겠습니까?";
    }

    if (otherMenuPopup.seq) {
      toggleFnAndCancelAlert({
        isActOpen: true,
        content: content,
        fn: () => deletePost(otherMenuPopup.seq || ""),
      });
    }
  };

  useEffect(() => {
    // 외부 클릭을 감지하는 함수
    const handleClickOutsideSettingMenu = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest) return;
      const closestIgnoreElement = target.closest(
        "[data-ignore-outside-click]"
      );

      if (
        settingMenuRef.current &&
        !settingMenuRef.current.contains(target) &&
        (!closestIgnoreElement ||
          closestIgnoreElement.getAttribute("data-ignore-outside-click") !==
            "true")
      ) {
        toggleSettingMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideSettingMenu);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSettingMenu);
    };
  }, []);

  useEffect(() => {
    // 외부 클릭을 감지하는 함수
    const handleClickOutsideOtherMenu = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest) return;
      const closestIgnoreElement = target.closest(
        "[data-ignore-outside-click]"
      );

      if (
        otherMenuRef.current &&
        !otherMenuRef.current.contains(target) &&
        (!closestIgnoreElement ||
          closestIgnoreElement.getAttribute("data-ignore-outside-click") !==
            "true") &&
        !usePostFolderPopupState.isActOpen
      ) {
        setOtherMenuPopup({ top: 0, left: 0, seq: null });
      }
    };

    document.addEventListener("mousedown", handleClickOutsideOtherMenu);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideOtherMenu);
    };
  }, [usePostFolderPopupState]);

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
              ref={settingMenuRef}
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
            onClick={() => router.push("/inbox")}
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
            ) : selectedSpace.notify &&
              selectedSpace.notify.notifyType === "participation" ? (
              <button
                type="button"
                className={`button ${styles.mainMenuDefault}`}
                style={{ lineHeight: "20px" }}
                onClick={() =>
                  handleRequest(
                    selectedSpace.UID,
                    selectedSpace.notify?.notifyUID,
                    false
                  )
                }
              >
                <img src="/images/icon/emoji_sad.svg" alt="" />
                <em className="normal">스페이스 참여 취소</em>
              </button>
            ) : selectedSpace.notify &&
              selectedSpace.notify.notifyType === "invite" ? (
              <>
                <button
                  type="button"
                  className={`button ${styles.mainMenuDefault}`}
                  style={{ lineHeight: "20px" }}
                  onClick={() =>
                    handleRequest(
                      selectedSpace.UID,
                      selectedSpace.notify?.notifyUID,
                      true
                    )
                  }
                >
                  <img src="/images/icon/emoji_smile.svg" alt="" />
                  <em className="normal">스페이스 초대 수락</em>
                </button>
                <button
                  type="button"
                  className={`button ${styles.mainMenuDefault}`}
                  style={{ lineHeight: "20px" }}
                  onClick={() =>
                    handleRequest(
                      selectedSpace.UID,
                      selectedSpace.notify?.notifyUID,
                      false
                    )
                  }
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
                <div className={`button ${styles.pageWrapper}`}>
                  <button
                    type="button"
                    className={`button ${styles.pageButton} ${
                      (pageSeq.seq === post.seq && pageSeq.pSeq === "") ||
                      otherMenuPopup.seq === post.seq
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
                    className={`button ${styles.pageMoreButton} ${
                      otherMenuPopup.seq === post.seq ? styles.active : ""
                    }`}
                    ref={otherMenuRef}
                    onClick={(e) => handleToggleOtherMenu(e, post.seq)}
                  >
                    <img
                      src="/images/icon/more.svg"
                      alt="이동, 복사, 삭제 등"
                      title="이동, 복사, 삭제 등"
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
      {/* 기타 메뉴 */}
      {otherMenuPopup.seq !== null && (
        <div
          className={styles.otherMenu}
          style={{
            top: otherMenuPopup.top + 20,
            left: otherMenuPopup.left + 10,
          }}
          data-ignore-outside-click
        >
          <button
            type="button"
            className="button"
            onClick={() => handleMoveAndCopyPost("move")}
          >
            이동
          </button>
          <button
            type="button"
            className="button"
            onClick={() => handleMoveAndCopyPost("copy")}
          >
            복사
          </button>
          <button type="button" className="button" onClick={handleDeletePost}>
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
