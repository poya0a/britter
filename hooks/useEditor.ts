import { useRecoilState } from "recoil";
import { atom } from "recoil";

interface EditorData {
  hasTableTag: boolean;
  title: string;
}

export const editorState = atom<EditorData>({
  key: "editorState",
  default: {
    hasTableTag: false,
    title: "",
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

  return {
    useEditorState,
    setHasTableTag,
    setTitle,
  };
};
