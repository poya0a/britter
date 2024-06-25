import { Node } from "@tiptap/core";

export default Node.create({
  name: "mention",

  group: "inline",

  atom: true,

  inline: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => ({
          id: element.getAttribute("data-id"),
        }),
        renderHTML: (attributes) => ({
          "data-id": attributes.id,
        }),
      },
      label: {
        default: null,
        parseHTML: (element) => ({
          label: element.textContent,
        }),
        renderHTML: (attributes) => ({
          textContent: attributes.label,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "mention",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mention", HTMLAttributes];
  },

  addKeyboardShortcuts() {
    return {};
  },
});
