import { useRecoilState } from "recoil";
import { atom } from "recoil";

interface EditorData {
  hasTableTag: boolean;
}

export const editorState = atom<EditorData>({
  key: "editorState",
  default: {
    hasTableTag: false,
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

  return {
    useEditorState,
    setHasTableTag,
  };
};
