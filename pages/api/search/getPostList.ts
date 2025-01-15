"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { createClient } from "@supabase/supabase-js";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  const { searchWord, page } = JSON.parse(req.body);

  authenticateToken(req, res, async () => {
    if (req.user) {
      try {
        const {
          data: posts,
          count: totalCount,
          error,
        } = await supabase
          .from("post")
          .select("UID, seq, title, content, space_uid")
          .or(`title.ilike.%${searchWord}%,content.ilike.%${searchWord}%`)
          .range((page - 1) * 10, page * 10 - 1)
          .limit(10);

        if (error && error.code !== "PGRST116" && error.code !== "PGRST103") throw error;

        if (posts && posts.length > 0) {
          const result = posts.map((post) => {
            return {
              UID: post.UID,
              seq: post.seq,
              space_uid: post.space_uid,
              title: post.title ? extractSnippet(post.title, searchWord) : getTruncatedText(post.title, 50),
              content: post.content ? extractSnippet(post.content, searchWord) : getTruncatedText(post.content, 50),
            };
          });

          const totalPages = Math.ceil(totalCount ?? 0 / 10);

          const pageInfo = {
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalCount,
            itemsPerPage: 10,
          };

          return res.status(200).json({
            message: "검색 완료했습니다.",
            data: result,
            pageInfo: pageInfo,
            resultCode: true,
          });
        } else {
          return res.status(200).json({
            message: "검색 결과가 없습니다.",
            data: [],
            pageInfo: 0,
            resultCode: true,
          });
        }
      } catch (error) {
        return res.status(200).json({
          message: "서버 에러가 발생하였습니다.",
          error: error,
          resultCode: false,
        });
      }
    } else {
      return res.status(200).json({
        message: "사용자 정보를 찾을 수 없습니다.",
        resultCode: false,
      });
    }
  });
}

function extractSnippet(text: string, searchWord: string): string {
  const snippetLength = 50;
  const searchWordIndex = text.indexOf(searchWord);

  if (searchWordIndex === -1) {
    return text.length <= snippetLength ? text : text.slice(0, snippetLength) + "...";
  }

  const start = Math.max(0, searchWordIndex - snippetLength);
  const end = Math.min(text.length, searchWordIndex + searchWord.length + snippetLength);

  return text.slice(start, end);
}

function getTruncatedText(text: string, length: number = 50): string {
  return text.length <= length ? text : text.slice(0, length) + "...";
}
