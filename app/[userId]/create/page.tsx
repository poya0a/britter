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
import { useRef } from "react";
import styles from "./page.module.scss";
import { useMainMenuWidth } from "@hooks/useMainMenuWidth";
import { useEditor } from "@hooks/useEditor";

const lowlight = createLowlight(common);

const extensions = [
  Color,
  ListItem,
  TextStyle,
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

export default function Create() {
  const divRef = useRef(null);
  const { useMainMenuWidthState } = useMainMenuWidth();
  const { setHasTableTag } = useEditor();

  const handleClick = (event: any) => {
    const clickedElement = event.target;
    if (focusTableTag(clickedElement)) {
      setHasTableTag(true);
    } else {
      setHasTableTag(false);
    }
  };

  return (
    <div>
      <MainMenu />
      <div
        ref={divRef}
        onClick={handleClick}
        onTouchStart={handleClick}
        className={styles.create}
        style={{
          width: `calc(100% - ${useMainMenuWidthState}px)`,
          left: `${useMainMenuWidthState}px`,
        }}
      >
        <EditorProvider extensions={extensions} slotBefore={<ToolBar />} />
      </div>
    </div>
  );
}
