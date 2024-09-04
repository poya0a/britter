function cleanBrokenTags(html: string): string {
  function removeBrokenTags(html: string): string {
    let cleanedHtml = html;

    cleanedHtml = cleanedHtml.replace(
      /<\/[^>]*>(?=[^<]*$)|(?<=^.*[^<])<[^>]*>$/g,
      ""
    );

    cleanedHtml = cleanedHtml.replace(/<[^>]*$/, "");
    cleanedHtml = cleanedHtml.replace(/^[^<]*>/, "");

    return cleanedHtml;
  }

  const cleanedHtml = removeBrokenTags(html);
  return cleanedHtml;
}

export default function convertHtmlToPreviewText(
  html: string,
  searchWord: string,
  maxLength: number = 50
): string {
  const parser = new DOMParser();

  function getTextWithHighlightedSearchWord(
    html: string,
    searchWord: string
  ): string {
    const doc = parser.parseFromString(html, "text/html");
    let text = doc.body.textContent || "";

    const regex = new RegExp(searchWord, "gi");
    text = text.replace(regex, `<strong>${searchWord}</strong>`);
    return text;
  }

  const cleanedHtml = cleanBrokenTags(html);
  const textWithHighlights = getTextWithHighlightedSearchWord(
    cleanedHtml,
    searchWord
  );

  function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  }
  return truncateText(textWithHighlights, maxLength);
}
