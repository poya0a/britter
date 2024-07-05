import { useRecoilState } from "recoil";
import { atom } from "recoil";

interface EditorData {
  hasTableTag: boolean;
  title: string;
  fontSize: string;
}

export const editorState = atom<EditorData>({
  key: "editorState",
  default: {
    hasTableTag: false,
    title: "",
    fontSize: "14",
  },
});

export const useEditor = () => {
  const [useEditorState, setUseEditorState] =
    useRecoilState<EditorData>(editorState);

  const setHasTableTag = (props: boolean) => {
    setUseEditorState((useEditorState) => ({
      ...useEditorState,
      hasTableTag: props,
    }));
  };

  const setTitle = (props: string) => {
    setUseEditorState((useEditorState) => ({
      ...useEditorState,
      title: props,
    }));
  };

  const setFontSize = (props: string) => {
    const fontSize = parseInt(props, 10);
    if (fontSize < 1 || fontSize > 999) return;
    setUseEditorState((useEditorState) => ({
      ...useEditorState,
      fontSize: props,
    }));
  };

  const plusFontSize = () => {
    const fontSize = parseInt(useEditorState.fontSize, 10);
    if (fontSize > 998) return;
    setUseEditorState((useEditorState) => ({
      ...useEditorState,
      fontSize: (fontSize + 1).toString(),
    }));
  };

  const minusFontSize = () => {
    const fontSize = parseInt(useEditorState.fontSize, 10);
    if (fontSize < 1) return;
    setUseEditorState((useEditorState) => ({
      ...useEditorState,
      fontSize: (fontSize - 1).toString(),
    }));
  };

  return {
    useEditorState,
    setHasTableTag,
    setTitle,
    setFontSize,
    plusFontSize,
    minusFontSize,
  };
};
