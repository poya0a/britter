"use client";
import MainMenu from "@components/menu/MainMenu";
import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { common, createLowlight } from "lowlight";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import ImageResize from "tiptap-extension-resize-image";
import ToolBar from "@components/common/ToolBar";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import { useMainMenuWidth } from "@/hooks/menu/useMainMenuWidth";
import { useEditor } from "@hooks/useEditor";
import { useRouter } from "next/navigation";
import { useToolBarHeight } from "@hooks/useToolBarHeight";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import { useAlert } from "@/hooks/popup/useAlert";
import Alert from "@components/popup/Alert";
import { PostData, usePost } from "@hooks/usePost";
import Toast from "@components/popup/Toast";
import { useToast } from "@hooks/popup/useToast";
import RoutAlert from "@components/popup/RouteAlert";
import FnAndCancelAlert from "@components/popup/FnAndCancelAlert";
import { useRouteAlert } from "@hooks/popup/useRouteAlert";
import { useFnAndCancelAlert } from "@hooks/popup/useFnAndCancelAlert";
import { useUpdateEffect } from "@utils/useUpdateEffect";
import SettingMenu from "@components/menu/SettingMenu";
import { useSettingMenu } from "@hooks/menu/useSettingMenu";
import CreatePopup from "@components/popup/CreatePopup";
import { useCreatePopup } from "@hooks/popup/useCreatePopup";
import { useSpace } from "@hooks/user/useSpace";
import { useSpaceSettingPopup } from "@hooks/popup/useSpaceSettingPopup";
import SpaceSettingPopup from "@components/popup/SpaceSettingPopup";

const lowlight = createLowlight(common);

const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: (element) =>
          element.style.fontSize.replace("px", "") || null,
        renderHTML: (attributes) => {
          return {
            style: `font-size: ${attributes.fontSize || "14"}px;`,
          };
        },
      },
    };
  },
});

const extensions = [
  Color,
  ListItem,
  CustomTextStyle,
  CodeBlockLowlight.configure({ lowlight }),
  Highlight.configure({
    multicolor: true,
  }),
  Underline,
  Image.configure({ inline: true, allowBase64: true }),
  ImageResize,
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Link.configure({
    openOnClick: true,
    autolink: true,
  }),
  Mention.configure({
    HTMLAttributes: {
      class: "mention",
    },
  }),
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
];

const focusTableTag = (element: HTMLElement): boolean => {
  let current: HTMLElement | null = element;

  while (current !== null) {
    if (
      current.tagName === "TABLE" ||
      current.parentElement?.tagName === "TABLE"
    ) {
      return true;
    }
    current = current.parentElement;
  }

  return false;
};

function findParentTitles(
  posts: PostData[],
  seq: string,
  path: { title: string; seq: string }[] = []
): { title: string; seq: string }[] {
  for (const post of posts) {
    if (post.seq === seq) {
      return [...path, { title: post.title, seq: post.seq }];
    }
    if (post.subPost) {
      const foundPath = findParentTitles(post.subPost, seq, [
        ...path,
        { title: post.title, seq: post.seq },
      ]);
      if (foundPath.length) {
        return foundPath;
      }
    }
  }
  return [];
}

export default function Page() {
  const divRef = useRef(null);
  const { useMainMenuWidthState } = useMainMenuWidth();
  const { useToolBarHeightState } = useToolBarHeight();
  const { useEditorState, setHasTableTag } = useEditor();
  const router = useRouter();
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const { useAlertState, toggleAlert } = useAlert();
  const { useRouteAlertState } = useRouteAlert();
  const { useFnAndCancelAlertState, toggleFnAndCancelAlert } =
    useFnAndCancelAlert();
  const { useToastState } = useToast();
  const { useSettingMenuState, toggleSettingMenu } = useSettingMenu();
  const { selectedSpace } = useSpace();
  const { useCreateState } = useCreatePopup();
  const { useSpaceSettingState } = useSpaceSettingPopup();
  const {
    usePostState,
    editorContent,
    type,
    pageSeq,
    pathname,
    auto,
    setEditorContent,
    savePost,
    deletePost,
    setAuto,
    setType,
    setPageSeq,
    setPathname,
    findPostBySeq,
  } = usePost();
  const [viewPost, setViewPost] = useState<PostData>();

  useEffect(() => {
    let seq = pageSeq.seq || pageSeq.pSeq;
    if (!(type === "create" && seq === "")) {
      const parentTitles = findParentTitles(usePostState, seq);
      setPathname(parentTitles);

      const selectedView = findPostBySeq(usePostState, seq);

      if (selectedView) {
        setViewPost(selectedView);
      }
      if (type === "view" && seq === "") router.push("/");
    } else {
      setPathname([]);
    }
  }, [pageSeq, usePostState]);

  useUpdateEffect(() => {
    if (type === "create" && auto !== null) {
      handleSavePost();
    }
  }, [auto]);

  const handleSavePost = async () => {
    try {
      // 업로드 안 한 이미지 전송
      var cheerio = require("cheerio");
      const $ = cheerio.load(editorContent);

      const imagePromises: Promise<ImageData | null>[] = $("img")
        .map(async (_: number, img: ImageData): Promise<ImageData> => {
          const $img = $(img);
          const src = $img.attr("src");
          const dataSeq = $img.attr("data-seq");

          if (src && !dataSeq) {
            try {
              const data = await uploadImageAndGetSequence(src);

              $img.attr("data-seq", data.seq.toString());
              $img.attr("src", data.path);
              return $img;
            } catch (error: any) {
              toggleAlert(error);
            }
          }
          return $img;
        })
        .get();

      await Promise.all(imagePromises);
      setEditorContent($.html());

      const formData = new FormData();

      if (pageSeq.pSeq !== "") formData.append("p_seq", pageSeq.pSeq);
      if (pageSeq.seq !== "") formData.append("seq", pageSeq.seq);
      formData.append("space", selectedSpace);
      formData.append(
        "title",
        useEditorState.title === "" ? "제목 없음" : useEditorState.title
      );
      formData.append("content", $.html());

      savePost(formData);
    } catch (error: any) {
      toggleAlert(error);
    }
  };

  const uploadImageAndGetSequence = async (
    src: string
  ): Promise<{ seq: number; path: string }> => {
    try {
      let blob: Blob;

      if (src.startsWith("data:image/")) {
        // data:image 형식 처리
        const base64Data = src.replace(/^data:image\/\w+;base64,/, "");
        const binaryString = atob(base64Data);
        const binaryData = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          binaryData[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([binaryData], { type: "image/jpeg" });
      } else if (src.startsWith("blob:")) {
        const response = await fetch(src);
        blob = await response.blob();
      } else {
        throw new Error("Unsupported image format");
      }

      const formData = new FormData();
      formData.append("file", blob, "image.jpeg");

      const res = await fetchApi({
        method: "POST",
        url: requests.FILE_UPLOAD,
        body: formData,
      });

      if (!res.resultCode) {
        toggleAlert(res.message);
      }
      return { seq: res.data.seq, path: res.data.path };
    } catch (error) {
      throw error;
    }
  };

  // 5분마다 자동 저장
  const startAutoSaveTimer = () => {
    autoSaveTimer.current = setInterval(() => {
      setAuto(true);
    }, 5 * 60 * 1000);
  };

  useEffect(() => {
    if (type === "create") {
      startAutoSaveTimer();
      return () => {
        if (autoSaveTimer.current) {
          clearInterval(autoSaveTimer.current);
        }
      };
    }
  }, [type, pageSeq]);

  const handleClick = (event: any) => {
    const clickedElement = event.target;
    if (focusTableTag(clickedElement)) {
      setHasTableTag(true);
    } else {
      setHasTableTag(false);
    }
    toggleSettingMenu(false);
  };

  const handleDeletePost = () => {
    let content = "삭제하시겠습니까?";

    if (viewPost?.subPost && viewPost?.subPost?.length > 0) {
      content = "하위 게시글도 함께 삭제됩니다. 삭제하시겠습니까?";
    }

    if (viewPost) {
      toggleFnAndCancelAlert({
        isActOpen: true,
        content: content,
        fn: () => deletePost(viewPost?.seq),
      });
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <MainMenu />
      <div
        ref={divRef}
        onClick={handleClick}
        onTouchStart={handleClick}
        className={styles.create}
        style={{
          width: `calc(100% - ${useMainMenuWidthState}px)`,
          height: `calc(100vh - ${
            type === "create" ? useToolBarHeightState + 146 : 130
          }px)`,
          left: `${useMainMenuWidthState}px`,
          marginTop: `${type === "create" ? useToolBarHeightState + 46 : 30}px`,
        }}
      >
        <div
          className={styles.pathname}
          style={{
            left: `${useMainMenuWidthState + 16}px`,
          }}
        >
          {pathname && pathname.length > 0 ? (
            pathname.map(
              (path: { title: string; seq: string }, idx: number) => (
                <button
                  key={`path-${idx}`}
                  className={`button ${styles.path}`}
                  onClick={() => {
                    pageSeq.seq !== path.seq
                      ? setPageSeq({ seq: path.seq, pSeq: "" })
                      : {};
                  }}
                >
                  {path.title}
                </button>
              )
            )
          ) : (
            <p className={styles.path}>{useEditorState.title}</p>
          )}
        </div>
        {type === "create" ? (
          <EditorProvider
            extensions={extensions}
            slotBefore={<ToolBar />}
            onUpdate={({ editor }) => {
              setEditorContent(editor.getHTML());
            }}
          />
        ) : (
          <>
            <h1 className={styles.title}>{viewPost?.title}</h1>
            <div
              style={{ padding: "0 15px" }}
              dangerouslySetInnerHTML={{ __html: viewPost?.content as string }}
            />
          </>
        )}
      </div>
      <div
        className={styles.createButton}
        style={{
          width: `calc(100% - ${useMainMenuWidthState}px)`,
          left: `${useMainMenuWidthState}px`,
        }}
        onClick={() => toggleSettingMenu(false)}
      >
        <div className={styles.createButtonWrapper}>
          <button
            type="button"
            className={`button ${buttonStyles.buttonBorderBlue}`}
            onClick={() =>
              type === "create" ? router.back() : handleDeletePost()
            }
          >
            {type === "create" ? "닫 기" : "삭 제"}
          </button>
          <button
            type="button"
            className={`button ${buttonStyles.buttonBlue}`}
            onClick={
              type === "create" ? () => setAuto(false) : () => setType("create")
            }
          >
            {type === "create" ? "저 장" : "수 정"}
          </button>
        </div>
      </div>
      {useAlertState.isActOpen && <Alert />}
      {useRouteAlertState.isActOpen && <RoutAlert />}
      {useFnAndCancelAlertState.isActOpen && <FnAndCancelAlert />}
      {useToastState.isActOpen && <Toast />}
      {useSettingMenuState.isActOpen && <SettingMenu />}
      {useCreateState.isActOpen && <CreatePopup />}
      {useSpaceSettingState.isActOpen && <SpaceSettingPopup />}
    </div>
  );
}
