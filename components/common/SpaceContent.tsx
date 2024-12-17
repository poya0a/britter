"use client";
import { useEffect, useState } from "react";
import fetchApi from "@fetch/fetch";
import requests from "@fetch/requests";
import { useSpaceStore } from "@stores/user/useSpaceStore";
import styles from "@styles/components/_common.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import { useMainMenuWidthStore } from "@stores/menu/useMainMenuWidthStore";
import { useToolBarHeightStore } from "@stores/useToolBarHeightStore";
import { useEditorStore } from "@stores/useEditorStore";
import ToolBar from "./ToolBar";
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
import { useAlertStore } from "@stores/popup/useAlertStore";
import { useFnAndCancelAlertStore } from "@stores/popup/useFnAndCancelAlertStore";

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
    defaultProtocol: "https",
    protocols: ["http", "https"],
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

export default function SpaceContent() {
  const {
    useSpaceState,
    useSelectedSpaceState,
    saveSpaceContent,
    deleteSpaceContent,
  } = useSpaceStore();
  const [type, setType] = useState<string>("");
  const { useMainMenuWidthState } = useMainMenuWidthStore();
  const { useToolBarHeightState } = useToolBarHeightStore();
  const [createHeight, setCreateHeight] = useState<string>("");
  const [createTop, setCreateTop] = useState<string>("");
  const { setHasTableTag } = useEditorStore();
  const [editorContent, setEditorContent] = useState<string>("");
  const { toggleAlert } = useAlertStore();
  const { toggleFnAndCancelAlert } = useFnAndCancelAlertStore();

  useEffect(() => {
    if (useSelectedSpaceState) {
      if (useSelectedSpaceState.space_content) {
        setType("view");
      } else {
        setType("");
      }
    }
  }, [useSelectedSpaceState]);

  useEffect(() => {
    if (useSelectedSpaceState) {
      if (
        useSpaceState.find((space) => space.UID === useSelectedSpaceState.UID)
      ) {
        if (type === "create") {
          setCreateHeight(`calc(100vh - ${useToolBarHeightState + 146}px)`);
          setCreateTop(`${useToolBarHeightState + 86}px`);
        } else if (type === "view") {
          setCreateHeight("calc(100vh - 130px)");
          setCreateTop("70px");
        } else {
          setCreateHeight("calc(100vh - 40px)");
          setCreateTop("40px");
        }
      } else {
        setCreateHeight("calc(100vh - 40px)");
        setCreateTop("40px");
      }
    }
  }, [useSelectedSpaceState, type]);

  const handleSavePost = async () => {
    try {
      // 업로드 안 한 이미지 전송
      var cheerio = require("cheerio");
      const $ = cheerio.load(editorContent);

      const imagePromises: Promise<ImageData | null | string>[] = $("img")
        .map(async (_: number, img: ImageData): Promise<ImageData | string> => {
          const $img = $(img);
          const src = $img.attr("src");
          const dataSeq = $img.attr("data-seq");
          if (src && !dataSeq) {
            const data = await uploadImageAndGetSequence(src);

            if (typeof data === "object" && "seq" in data && "path" in data) {
              $img.attr("data-seq", data.seq.toString());
              $img.attr("src", data.path);
              return $img;
            } else {
              return data;
            }
          }
          return $img;
        })
        .get();
      const imagesUpdate = await Promise.all(imagePromises);

      const errorMessage = imagesUpdate.find(
        (result) => typeof result === "string"
      ) as string | undefined;

      if (errorMessage) {
        return toggleAlert(errorMessage);
      }
      setEditorContent($.html());

      if (!useSelectedSpaceState) {
        return toggleAlert(
          "스페이스 정보를 찾을 수 없습니다. 다시 시도해 주세요."
        );
      }

      const formData = new FormData();

      formData.append("space", useSelectedSpaceState.UID);
      formData.append("content", $.html());

      const saveContent = await saveSpaceContent(formData);
      if (saveContent) {
        setType("view");
      }
    } catch (error: any) {
      toggleAlert(error.message || "게시물 저장 중 오류가 발생했습니다.");
    }
  };

  const uploadImageAndGetSequence = async (
    src: string
  ): Promise<{ seq: number; path: string } | string> => {
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
      return "지원하는 이미지 파일 타입이 아닙니다.";
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (blob.size > MAX_SIZE) {
      return "파일 크기가 5MB를 초과합니다.";
    }

    const formData = new FormData();
    formData.append("file", blob, "image.jpeg");

    const res = await fetchApi({
      method: "POST",
      url: requests.FILE_UPLOAD,
      body: formData,
    });

    if (!res.resultCode) {
      return res.message;
    }
    return { seq: res.data.seq, path: res.data.path };
  };

  const handleClick = (event: any) => {
    const clickedElement = event.target;
    if (focusTableTag(clickedElement)) {
      setHasTableTag(true);
    } else {
      setHasTableTag(false);
    }
  };

  const handleDeleteContent = () => {
    toggleFnAndCancelAlert({
      isActOpen: true,
      content: "삭제하시겠습니까?",
      fn: () => {
        if (useSelectedSpaceState) {
          deleteSpaceContent(useSelectedSpaceState.UID);
        } else {
          toggleAlert("스페이스 정보를 찾을 수 없습니다. 다시 시도해 주세요.");
        }
      },
    });
  };

  return (
    <div
      className={styles.create}
      style={{
        width: `calc(100% - ${useMainMenuWidthState}px)`,
        height: createHeight,
        left: `${useMainMenuWidthState}px`,
        marginTop: createTop,
      }}
      onClick={handleClick}
      onTouchStart={handleClick}
    >
      {type !== "" ? (
        <>
          <>
            {type === "create" ? (
              <EditorProvider
                extensions={extensions}
                slotBefore={
                  <ToolBar
                    titile={false}
                    content={useSelectedSpaceState.space_content}
                  />
                }
                onUpdate={({ editor }) => {
                  setEditorContent(editor.getHTML());
                }}
                // SSR과 클라이언트 측 렌더링 일치를 위한 속성 제거
                immediatelyRender={false}
              />
            ) : (
              <div
                style={{ padding: "0 15px" }}
                dangerouslySetInnerHTML={{
                  __html: useSelectedSpaceState.space_content as string,
                }}
              />
            )}
          </>
          <div
            className={styles.createButton}
            style={{
              width: `calc(100% - ${useMainMenuWidthState}px)`,
              left: `${useMainMenuWidthState}px`,
            }}
          >
            <div className={styles.createButtonWrapper}>
              {useSelectedSpaceState.space_content && (
                <button
                  type="button"
                  className={`button ${buttonStyles.buttonBorderBlue}`}
                  onClick={handleDeleteContent}
                >
                  삭&nbsp;제
                </button>
              )}
              <button
                type="button"
                className={`button ${buttonStyles.buttonBlue}`}
                onClick={() => {
                  if (type === "create") {
                    handleSavePost();
                  } else {
                    setType("create");
                  }
                }}
              >
                {type === "create" ? "저 장" : "수 정"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.noContent}>
          <p>스페이스 콘텐츠가 없습니다.</p>
          {useSpaceState &&
            useSelectedSpaceState &&
            useSpaceState.find(
              (space) => space.UID === useSelectedSpaceState.UID
            ) && (
              <>
                <p>생성하시겠습니까?</p>
                <button
                  type="button"
                  className={`button ${buttonStyles.buttonBlue}`}
                  onClick={() => setType("create")}
                >
                  생&nbsp;성
                </button>
              </>
            )}
        </div>
      )}
    </div>
  );
}
