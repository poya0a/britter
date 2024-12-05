"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { getDataSource } from "@database/typeorm.config";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@server/utils/authenticateToken";
import { Post } from "@entities/Post.entity";

export default async function handler(
  req: AuthenticatedRequest & NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }
  const { searchWord, page } = JSON.parse(req.body);

  authenticateToken(req, res, async () => {
    if (req.user) {
      try {
        const dataSource = await getDataSource();
        const postRepository = dataSource.getRepository(Post);
        const [findPost, totalCount] = await postRepository
          .createQueryBuilder("post")
          .where("post.title LIKE :searchWord COLLATE utf8mb4_general_ci", {
            searchWord: `%${searchWord}%`,
          })
          .orWhere(
            "REGEXP_REPLACE(post.content, '<[^>]+>', '') LIKE :searchWord COLLATE utf8mb4_general_ci",
            { searchWord: `%${searchWord}%` }
          )
          .select([
            "post.UID",
            "post.seq",
            "post.title",
            "post.content",
            "post.space_uid",
          ])
          .skip((page - 1) * 10)
          .take(10)
          .getManyAndCount();

        if (findPost) {
          const result = findPost.map((post) => {
            return {
              UID: post.UID,
              seq: post.seq,
              space_uid: post.space_uid,
              title: post.title
                ? extractSnippet(post.title, searchWord)
                : getTruncatedText(post.title, 50),
              content: post.content
                ? extractSnippet(post.content, searchWord)
                : getTruncatedText(post.content, 50),
            };
          });

          const totalPages = Math.ceil(totalCount / 10);

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

            resultCode: true,
          });
        }
      } catch (error) {
        return res.status(500).json({
          message:
            typeof error === "string" ? error : "서버 에러가 발생하였습니다.",
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
    return text.length <= snippetLength
      ? text
      : text.slice(0, snippetLength) + "...";
  }

  const start = Math.max(0, searchWordIndex - snippetLength);
  const end = Math.min(
    text.length,
    searchWordIndex + searchWord.length + snippetLength
  );

  return text.slice(start, end);
}

function getTruncatedText(text: string, length: number = 50): string {
  return text.length <= length ? text : text.slice(0, length) + "...";
}
