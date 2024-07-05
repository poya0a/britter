"use client";
import MainMenu from "@components/common/MainMenu";
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
import styles from "@styles/components/_common.module.scss";
import commonStyles from "@styles/components/_common.module.scss";
import { useMainMenuWidth } from "@hooks/useMainMenuWidth";
import { useEditor } from "@hooks/useEditor";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useToolBarHeight } from "@hooks/useToolBarHeight";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import { useAlert } from "@/hooks/popup/useAlert";
import Alert from "@components/popup/Alert";
import { PostData, usePost } from "@hooks/usePost";
import Toast from "../popup/Toast";
import { useToast } from "@/hooks/popup/useToast";
import { useInfo } from "@hooks/useInfo";
import RoutAlert from "../popup/RouteAlert";
import FnAndCancelAlert from "../popup/FnAndCancelAlert";
import { useRouteAlert } from "@hooks/popup/useRouteAlert";
import { useFnAndCancelAlert } from "@hooks/popup/useFnAndCancelAlert";

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

export default function Page({ type }: { type: string }) {
  const divRef = useRef(null);
  const { useMainMenuWidthState } = useMainMenuWidth();
  const { useToolBarHeightState } = useToolBarHeight();
  const { useEditorState, setHasTableTag } = useEditor();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [pPageSeq, setpPagSeq] = useState<string>("");
  const [editorContent, setEditorContent] = useState<string>("");
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const { useAlertState, toggleAlert } = useAlert();
  const { useRouteAlertState } = useRouteAlert();
  const { useFnAndCancelAlertState, toggleFnAndCancelAlert } =
    useFnAndCancelAlert();
  const { useToastState } = useToast();
  const { usePostState, pageSeq, setPageSeq, savePost, deletePost } = usePost();
  const { useInfoState } = useInfo();
  const [viewPost, setViewPost] = useState<PostData>();

  useEffect(() => {
    if (type === "view") {
      const selectedView = findPostBySeq(
        usePostState,
        pathname?.split("/").filter(Boolean).pop() || ""
      );
      setViewPost(selectedView);
    }
  }, [pathname]);

  function findPostBySeq(posts: PostData[], seq: string): PostData | undefined {
    for (const post of posts) {
      if (post.seq === seq) {
        return post;
      }
      if (post.subPost) {
        const found = findPostBySeq(post.subPost, seq);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }

  useEffect(() => {
    if (type === "create") {
      // 부모 페이지 아이디 (하위 페이지 신규 생성)
      const pPageSeq = searchParams?.get("p_page");
      if (pPageSeq) {
        setpPagSeq(pPageSeq);
      } else {
        setpPagSeq("");
      }

      // 페이지 아이디 (수정)
      const pageSeq = searchParams?.get("page");
      if (pageSeq) {
        setPageSeq(pageSeq);
      } else {
        setPageSeq("");
      }
    }
  }, [searchParams]);

  const handleSavePost = async () => {
    // 업로드 안 한 이미지 전송
    var cheerio = require("cheerio");
    const $ = cheerio.load(editorContent);
    const imageTags = $("img");

    const imageSrcsPromises = imageTags
      .map(async (_: number, img: any) => {
        const src = $(img).attr("src");
        if (src && !$(img).attr("data-seq")) {
          try {
            const data = await uploadImageAndGetSequence(src);

            $(img).attr("src", data.path);
            $(img).attr("data-seq", data.seq);
            return data.path;
          } catch (error: any) {
            toggleAlert(error);
            return null;
          }
        }
        return src;
      })
      .get();

    try {
      await Promise.all(imageSrcsPromises);
      setEditorContent($.html());

      const formData = new FormData();

      if (pPageSeq !== "" && pPageSeq !== null) {
        formData.append("p_seq", pPageSeq);
      }

      if (pageSeq !== "" && pageSeq !== null) {
        formData.append("seq", pageSeq);
      }

      formData.append(
        "title",
        useEditorState.title === "" ? "제목 없음" : useEditorState.title
      );

      formData.append("content", editorContent);
      savePost(formData);
      resetAutoSaveTimer();
    } catch (error: any) {
      toggleAlert(error);
    }
  };

  const uploadImageAndGetSequence = async (
    src: string
  ): Promise<{ seq: number; path: string }> => {
    try {
      const base64Data = src.replace(/^data:image\/\w+;base64,/, "");

      const binaryString = atob(base64Data);

      const binaryData = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        binaryData[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([binaryData], { type: "image/jpg" });

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
      handleSavePost();
    }, 5 * 60 * 1000);
  };

  // 타이머 리셋
  const resetAutoSaveTimer = () => {
    if (autoSaveTimer.current) {
      clearInterval(autoSaveTimer.current);
    }
    startAutoSaveTimer();
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
  }, [type]);

  const handleClick = (event: any) => {
    const clickedElement = event.target;
    if (focusTableTag(clickedElement)) {
      setHasTableTag(true);
    } else {
      setHasTableTag(false);
    }
  };

  const modifyPost = () => {
    const lastSegment = pathname?.split("/").filter(Boolean).pop();
    router.push(`/${useInfoState.user_id}?page=${lastSegment}`);
  };

  const handleDeletePost = () => {
    const formData = new FormData();
    if (viewPost) formData.append("seq", viewPost?.seq);

    let content = "삭제하시겠습니까?";

    if (viewPost?.subPost && viewPost?.subPost?.length > 0) {
      content = "하위 게시글도 함께 삭제됩니다. 삭제하시겠습니까?";
    }

    toggleFnAndCancelAlert({
      isActOpen: true,
      content: content,
      fn: () => deletePost(formData),
    });
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
            type === "create" ? useToolBarHeightState + 116 : 100
          }px)`,
          left: `${useMainMenuWidthState}px`,
          marginTop: `${type === "create" ? useToolBarHeightState + 16 : 0}px`,
        }}
      >
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
      >
        <div className={styles.createButtonWrapper}>
          <button
            type="button"
            className={`button ${commonStyles.buttonBorderBlue}`}
            onClick={() =>
              type === "create" ? router.back() : handleDeletePost()
            }
          >
            {type === "create" ? "닫 기" : "삭 제"}
          </button>
          <button
            type="button"
            className={`button ${commonStyles.buttonBlue}`}
            onClick={type === "create" ? handleSavePost : modifyPost}
          >
            {type === "create" ? "저 장" : "수 정"}
          </button>
        </div>
      </div>
      {useAlertState.isActOpen && <Alert />}
      {useRouteAlertState.isActOpen && <RoutAlert />}
      {useFnAndCancelAlertState.isActOpen && <FnAndCancelAlert />}
      {useToastState.isActOpen && <Toast />}
    </div>
  );
}
