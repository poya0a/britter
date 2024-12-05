import React, { useState, useEffect } from "react";
import storage from "@fetch/auth/storage";
import { usePostFolderPopup } from "@hooks/popup/usePostFolderPopup";
import styles from "@styles/components/_popup.module.scss";
import menuStyles from "@styles/components/_menu.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import { PostListData, usePost } from "@hooks/usePost";

export default function PostFolderPopup() {
  const { usePostFolderPopupState, togglePostFolderPopup } =
    usePostFolderPopup();
  const { usePostListState } = usePost();
  const [selectFolder, setSelectFolder] = useState<string>("");
  const [expandedPosts, setExpandedPosts] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPosts = storage.getExpandedPosts();
      if (storedPosts) {
        setExpandedPosts(JSON.parse(storedPosts));
      }
    }
  }, []);

  const handleMoveAndCopy = () => {
    if (selectFolder === "") return;
    togglePostFolderPopup({
      ...usePostFolderPopupState,
      isActOpen: false,
      pSeq: selectFolder,
    });
  };

  const renderSubPages = (subPages: PostListData[], depth: number) => {
    if (!subPages || subPages.length === 0) {
      return null;
    }

    return (
      <div style={{ paddingLeft: (depth + 1) * 5 + "px" }}>
        <ul className={`list ${menuStyles.pageList}`}>
          {subPages.map((post: PostListData, idx: number) => (
            <li
              className={`list ${menuStyles.pageItem}`}
              key={`post-sub${depth}-${idx}`}
            >
              <div className={`button ${menuStyles.pageWrapper}`}>
                <button
                  type="button"
                  className={`button ${menuStyles.pageButton} ${
                    selectFolder === post.seq ? styles.active : ""
                  }`}
                  onClick={() => handleSelectFolder(post.seq)}
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

  const handleSelectFolder = (folder: string) => {
    if (selectFolder === folder) {
      setSelectFolder("");
    } else {
      setSelectFolder(folder);
    }
  };

  return (
    <div className={styles.popup}>
      <div
        className={styles.dim}
        onClick={() =>
          togglePostFolderPopup({
            ...usePostFolderPopupState,
            isActOpen: false,
          })
        }
      />
      <div className={styles.popupWrapper}>
        <h3>
          게시글 {usePostFolderPopupState.type === "move" ? "이동" : "복사"}
        </h3>
        <div className={styles.postFolderWrapper}>
          <div className={menuStyles.pageMenu}>
            <div className={menuStyles.pageWrapper}>
              <button
                type="button"
                className={`button ${menuStyles.pageButton} ${
                  selectFolder === "all" ? styles.active : ""
                }`}
                onClick={() => handleSelectFolder("all")}
              >
                <img src="/images/icon/folder.svg" alt="전체" />
                <em className="normal">전체</em>
              </button>
              <ul
                className={`list ${menuStyles.pageList} ${menuStyles.pageListWrap}`}
                style={{ paddingLeft: "5px" }}
              >
                {usePostListState.map((post: PostListData, idx: number) => (
                  <li
                    className={`list ${menuStyles.pageItem}`}
                    key={`post-${idx}`}
                  >
                    <div className={menuStyles.pageWrapper}>
                      <button
                        type="button"
                        className={`button ${menuStyles.pageButton} ${
                          selectFolder === post.seq ? styles.active : ""
                        }`}
                        onClick={() => handleSelectFolder(post.seq)}
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
        </div>
        <button
          type="button"
          className={`button ${buttonStyles.buttonBlue}`}
          onClick={handleMoveAndCopy}
        >
          {usePostFolderPopupState.type === "move" ? "이동" : "복사"}
        </button>
      </div>
    </div>
  );
}
