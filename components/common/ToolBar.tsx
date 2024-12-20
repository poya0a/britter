import { useCurrentEditor } from "@tiptap/react";
import styles from "@styles/components/_common.module.scss";
import { useCallback, useEffect, useRef, useState } from "react";
import { Editor } from "@tiptap/core";
import { useEditorStore } from "@stores/useEditorStore";
import { SketchPicker, ColorResult } from "react-color";
import { useMainMenuWidthStore } from "@stores/menu/useMainMenuWidthStore";
import { useToolBarHeightStore } from "@stores/useToolBarHeightStore";
import { usePostStore } from "@stores/user/usePostStore";
import { useUpdateEffect } from "@utils/useUpdateEffect";
import { useURLPopupStore } from "@stores/popup/useURLPopupStore";

const isTablePresent = (editor: Editor): boolean => {
  const { selection } = editor.state;
  const $from = selection.$from;
  let found = false;

  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (node.type.name === "table") {
      found = true;
      break;
    }
  }

  return found;
};

export default function ToolBar({
  titile,
  content,
}: {
  titile: boolean;
  content?: string;
}) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const { handleToolBarHeight } = useToolBarHeightStore();
  const { useMainMenuWidthState } = useMainMenuWidthStore();
  const { editor } = useCurrentEditor();
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [currentTextColor, setCurrentTextColor] = useState<string>("#1F1F1F");
  const [currentHighlightColor, setCurrentHighlightColor] =
    useState<string>("transparent");
  const [type, setType] = useState<string>("");
  const [autoSaved, setAutoSaved] = useState<boolean>(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const {
    useEditorState,
    setHasTableTag,
    setTitle,
    setFontSize,
    plusFontSize,
    minusFontSize,
  } = useEditorStore();
  const { useURLPopupState, toggleURLPopup } = useURLPopupStore();
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const {
    auto,
    editorContent,
    usePostState,
    type: pageType,
    pageSeq,
  } = usePostStore();

  if (editor === null) return;

  // 리사이즈
  useEffect(() => {
    const handleResize = (entries: ResizeObserverEntry[]) => {
      const toolbarElement = entries[0].target as HTMLDivElement;
      handleToolBarHeight(toolbarElement.offsetHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);

    if (toolbarRef.current) {
      resizeObserver.observe(toolbarRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 컬러 피커
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (editor === null || colorPickerRef.current === null) return;

      const target = event.target as Element | null;

      if (target === null) return;

      const closestIgnoreElement = target.closest(
        "[data-ignore-outside-click]"
      );

      if (
        !closestIgnoreElement &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
        setType("");
        editor.view.dom.style.pointerEvents = "auto";
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 폰트 사이즈
  useEffect(() => {
    if (useEditorState.fontSize) {
      editor
        .chain()
        .setMark("textStyle", {
          fontSize: useEditorState.fontSize,
        })
        .run();
    }
  }, [useEditorState.fontSize, editor]);

  // 게시글 수정
  useEffect(() => {
    if (content) {
      editor.chain().setContent(content).run();
    } else {
      setTitle("");
      editor.chain().setContent("").run();
    }
    if (pageType === "create" && pageSeq.seq !== "") {
      if (!autoSaved) {
        setTitle(usePostState.title);
        editor.chain().setContent(usePostState.content).run();
        setAutoSaved(true);
      }
    }
    setFontSize("14");
  }, [pageType, pageSeq.seq, usePostState]);

  useUpdateEffect(() => {
    if (pageType === "create" && pageSeq.seq !== "" && autoSaved) {
      setTitle(useEditorState.title);
      editor.chain().setContent(editorContent).run();
    }
  }, [auto]);

  const handleColorChange = (color: ColorResult) => {
    if (type === "text") {
      editor.chain().focus().setColor(color.hex).run();
      setCurrentTextColor(color.hex);
    } else if (type === "highlight") {
      editor.commands.setHighlight({ color: color.hex });
      setCurrentHighlightColor(color.hex);
    }
  };

  const handleButtonClick = (name: string) => {
    if (name === type) {
      setShowColorPicker(false);
      setType("");
    } else {
      setShowColorPicker(true);
      setType(name);
    }
  };

  // const setMention = () => {

  // };

  useUpdateEffect(() => {
    if (!useURLPopupState.isActOpen && useURLPopupState.value.URL !== null) {
      editor.commands.setContent(
        `<a href="${useURLPopupState.value.URL}" target="_blank">${
          useURLPopupState.value.label === null
            ? useURLPopupState.value.URL
            : useURLPopupState.value.label
        }</a>`
      );
    }
  }, [useURLPopupState.isActOpen]);

  const createTable = useCallback(() => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();

    if (editor) {
      setHasTableTag(isTablePresent(editor));
    }
  }, [editor]);

  const deleteTable = useCallback(() => {
    editor.chain().focus().deleteTable().run();

    if (editor) {
      setHasTableTag(isTablePresent(editor));
    }
  }, [editor]);

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        insertImage(file);
      }
    },
    [editor]
  );

  const insertImage = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result?.toString();
        if (base64Image) {
          editor?.chain().focus().setImage({ src: base64Image }).run();
        }
      };
      reader.readAsDataURL(file);
    },
    [editor]
  );

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editor.commands.focus();
    }
  };

  // 복사 / 붙여넣기로 이미지 저장
  const handlePaste = async (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.includes("image")) {
        const blob = item.getAsFile();
        if (!blob) continue;

        event.preventDefault();

        try {
          const imageUrl = URL.createObjectURL(blob);
          editor.chain().focus().setImage({ src: imageUrl }).run();
        } catch (error) {
          alert(`Error handling pasted image: ${error}`);
        }
      }
    }
  };

  useEffect(() => {
    const handleEditorPaste = (event: ClipboardEvent) => {
      handlePaste(event);
    };

    if (editor) {
      const editorElement = editor.view.dom;
      editorElement.addEventListener("paste", handleEditorPaste);

      return () => {
        editorElement.removeEventListener("paste", handleEditorPaste);
      };
    }
  }, [editor]);

  return (
    <>
      <div
        ref={toolbarRef}
        className={styles.toolbar}
        style={{
          width: `calc(100% - ${useMainMenuWidthState + 32}px)`,
          left: `${useMainMenuWidthState + 16}px`,
        }}
      >
        <div className={styles.toolbarWrapper}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? `${styles.active}` : ""}
            title="강조"
          >
            <img src="/images/icon/bold.svg" alt="bold" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? `${styles.active}` : ""}
            title="기울임"
          >
            <img src="/images/icon/italic.svg" alt="italic" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? `${styles.active}` : ""}
            title="가운데 선"
          >
            <img src="/images/icon/strikethrough.svg" alt="strike" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            className={editor.isActive("underline") ? `${styles.active}` : ""}
            title="밑줄"
          >
            <img src="/images/icon/underline.svg" alt="underline" />
          </button>
          <button
            type="button"
            name="text"
            data-ignore-outside-click={true}
            onClick={() => handleButtonClick("text")}
            className={type === "text" ? `${styles.active}` : ""}
            title="색상"
          >
            <img src="/images/icon/text_color.svg" alt="color" />
            <i
              className={styles.colorbar}
              style={{
                backgroundColor: currentTextColor,
                border:
                  currentTextColor === "#ffffff" ? "1px solid #1f1f1f" : "",
              }}
            />
          </button>
          <button
            type="button"
            name="highlight"
            data-ignore-outside-click={true}
            onClick={() => handleButtonClick("highlight")}
            className={type === "highlight" ? `${styles.active}` : ""}
            title="하이라이트"
          >
            <img src="/images/icon/text_highlight.svg" alt="highlight" />
            <i
              className={styles.colorbar}
              style={{
                backgroundColor: currentHighlightColor,
                border:
                  currentHighlightColor === "transparent" ||
                  currentHighlightColor === "#ffffff"
                    ? "1px solid #1f1f1f"
                    : "",
              }}
            />
          </button>
          {showColorPicker && (
            <div className={styles.colorPicker} ref={colorPickerRef}>
              <SketchPicker
                color={
                  type === "text" ? currentTextColor : currentHighlightColor
                }
                onChange={handleColorChange}
              />
            </div>
          )}
          <div className={styles.fontSizeWrapper}>
            <input
              type="text"
              name="font_size"
              id="fontSize"
              className="input"
              value={useEditorState.fontSize}
              onChange={(e) => setFontSize(e.target.value)}
            />
            <button
              type="button"
              className={`button ${styles.fontSizeButton}`}
              onClick={plusFontSize}
            >
              <img src="/images/icon/up.svg" alt="" />
            </button>
            <button
              type="button"
              className={`button ${styles.fontSizeButton}`}
              onClick={minusFontSize}
            >
              <img src="/images/icon/down.svg" alt="" />
            </button>
          </div>
        </div>
        <div className={styles.toolbarWrapper}>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={
              editor.isActive({ textAlign: "left" }) ? `${styles.active}` : ""
            }
            title="좌측 정렬"
          >
            <img src="/images/icon/textalign_left.svg" alt="left" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={
              editor.isActive({ textAlign: "center" }) ? `${styles.active}` : ""
            }
            title="가운데 정렬"
          >
            <img src="/images/icon/textalign_center.svg" alt="center" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={
              editor.isActive({ textAlign: "right" }) ? `${styles.active}` : ""
            }
            title="우측 정렬"
          >
            <img src="/images/icon/textalign_right.svg" alt="right" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={
              editor.isActive({ textAlign: "justify" })
                ? `${styles.active}`
                : ""
            }
            title="양쪽 맞춤"
          >
            <img src="/images/icon/textalign_justify.svg" alt="justify" />
          </button>
        </div>
        <div className={styles.toolbarWrapper}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? `${styles.active}` : ""}
            title="단추형 목록"
          >
            <img src="/images/icon/list_ul.svg" alt="bulletList" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? `${styles.active}` : ""}
            title="번호형 목록"
          >
            <img src="/images/icon/list_ol.svg" alt="orderedList" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={editor.isActive("taskList") ? `${styles.active}` : ""}
            title="체크박스 목록"
          >
            <img src="/images/icon/todo_tasks_list.svg" alt="taskList" />
          </button>
        </div>
        <div className={styles.toolbarWrapper}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive("codeBlock") ? `${styles.active}` : ""}
            title="코드 블럭"
          >
            <img src="/images/icon/code.svg" alt="codeBlock" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive("blockquote") ? `${styles.active}` : ""}
            title="인용"
          >
            <img src="/images/icon/blockquote.svg" alt="blockquote" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="가로선"
          >
            <img src="/images/icon/horizontal_line.svg" alt="horizontal_line" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHardBreak().run()}
            title="줄바꿈"
          >
            <img src="/images/icon/hardbreak.svg" alt="hardbreak" />
          </button>
        </div>
        <div className={styles.toolbarWrapper}>
          <input
            type="file"
            accept="image/*"
            ref={imgRef}
            onChange={handleImageUpload}
            style={{ display: "none" }}
            id="fileInput"
          />
          <button
            type="button"
            onClick={() => {
              if (imgRef.current) {
                imgRef.current.click();
              }
            }}
            title="파일과 그림 삽입"
          >
            <img src="/images/icon/album.svg" alt="add image" />
          </button>
          <button type="button" onClick={createTable} title="표 생성">
            <img src="/images/icon/grid.svg" alt="create grid" />
          </button>
          {/* 멘션 기능 보류
          <button type="button" onClick={setMention} title="언급">
            <img src="/images/icon/at.svg" alt="mention" />
          </button> */}
          <button
            type="button"
            onClick={() => toggleURLPopup(true)}
            title="연결 삽입"
          >
            <img src="/images/icon/link.svg" alt="link" />
          </button>
        </div>
        <div className={styles.toolbarWrapper}>
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            title="뒤로 가기"
          >
            <img src="/images/icon/undo.svg" alt="undo" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            title="앞으로 가기"
          >
            <img src="/images/icon/redo.svg" alt="redo" />
          </button>
        </div>
        <br />
        {useEditorState.hasTableTag && (
          <div>
            <div className={styles.toolbarWrapper}>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowBefore().run()}
                title="위에 행 추가"
              >
                <img
                  src="/images/icon/table_row_plus_before.svg"
                  alt="table_row_plus_before"
                />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                title="아래에 행 추가"
              >
                <img
                  src="/images/icon/table_row_plus_after.svg"
                  alt="아래에 행 추가"
                />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteRow().run()}
                title="행 삭제"
              >
                <img
                  src="/images/icon/table_row_remove.svg"
                  alt="table_row_remove"
                />
              </button>
            </div>
            <div className={styles.toolbarWrapper}>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                title="왼쪽에 열 삽입"
              >
                <img
                  src="/images/icon/table_column_plus_before.svg"
                  alt="table_column_plus_before"
                />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                title="오른쪽에 열 삽입"
              >
                <img
                  src="/images/icon/table_column_plus_after.svg"
                  alt="table_column_plus_after"
                />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                title="열 삭제"
              >
                <img
                  src="/images/icon/table_column_remove.svg"
                  alt="table_column_remove"
                />
              </button>
            </div>
            <div className={styles.toolbarWrapper}>
              <button
                type="button"
                onClick={() => editor.chain().focus().mergeCells().run()}
                title="셀 병합"
              >
                <img
                  src="/images/icon/table_merge_cells.svg"
                  alt="Merge cells"
                />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().splitCell().run()}
                title="병합된 셀 나누기"
              >
                <img
                  src="/images/icon/table_split_cells.svg"
                  alt="Split cell"
                />
              </button>
            </div>
            <div className={styles.toolbarWrapper}>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                title="머릿행"
              >
                <img src="/images/icon/table_head.svg" alt="table_head" />
              </button>
              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().toggleHeaderColumn().run()
                }
                title="머릿열"
              >
                <img
                  src="/images/icon/table_head.svg"
                  alt="table_head"
                  style={{ transform: "rotate(-90deg)" }}
                />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeaderCell().run()}
                title="머릿셀"
              >
                <img src="/images/icon/table_cell.svg" alt="table_head" />
              </button>
            </div>
            <div className={styles.toolbarWrapper}>
              <button
                type="button"
                onClick={() => editor.chain().focus().fixTables().run()}
                title="틀 고정"
              >
                <img src="/images/icon/table_fixed.svg" alt="Fix tables" />
              </button>
            </div>
            <div className={styles.toolbarWrapper}>
              <button type="button" onClick={deleteTable} title="표 삭제">
                <img src="/images/icon/grid_off.svg" alt="Delete table" />
              </button>
            </div>
          </div>
        )}
      </div>
      {titile && (
        <input
          type="text"
          className={`input ${styles.title}`}
          placeholder="제목 없음"
          maxLength={50}
          onKeyUp={handleEnter}
          onChange={(e) => setTitle(e.target.value)}
          value={useEditorState.title}
        />
      )}
    </>
  );
}
