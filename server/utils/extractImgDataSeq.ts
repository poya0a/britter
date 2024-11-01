// img 태그의 data-seq를 추출하는 함수
export function extractImgDataSeq(content: string): number[] {
  const imgTagRegex = /<img[^>]+data-seq=["']?(\d+)["']?[^>]*>/g;
  const dataSeqList: number[] = [];
  let match;

  while ((match = imgTagRegex.exec(content)) !== null) {
    dataSeqList.push(parseInt(match[1], 10));
  }

  return dataSeqList;
}
