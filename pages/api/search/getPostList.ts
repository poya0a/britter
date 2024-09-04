"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { AppDataSource } from "@database/typeorm.config";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@/server/utils/authenticateToken";
import { ILike } from "typeorm";
import { Post } from "@entities/Post.entity";

export default async function handler(
  req: AuthenticatedRequest & NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }
  const { searchWord } = JSON.parse(req.body);

  authenticateToken(req, res, async () => {
    if (req.user) {
      try {
        const dataSource = await AppDataSource.useFactory();
        const postRepository = dataSource.getRepository(Post);
        const findPost = await postRepository.find({
          where: [
            { title: ILike(`%${searchWord}%`) },
            { content: ILike(`%${searchWord}%`) },
          ],
          select: ["UID", "seq", "title", "content", "space_uid"],
        });

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

          return res.status(200).json({
            message: "검색 완료했습니다.",
            data: result,
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
