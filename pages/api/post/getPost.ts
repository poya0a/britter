"use server";
import { NextApiRequest, NextApiResponse } from "next";
import { AppDataSource } from "@database/typeorm.config";
import { Post } from "@entities/Post.entity";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@/server/utils/authenticateToken";

export default async function handler(
  req: AuthenticatedRequest & NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }
  authenticateToken(req, res, async () => {
    const postSeq = req.query.postSeq as string;

    if (req.user && postSeq) {
      try {
        const dataSource = await AppDataSource.useFactory();
        const postRepository = dataSource.getRepository(Post);

        const findPost = await postRepository.findOne({
          where: { seq: postSeq },
        });

        if (findPost) {
          return res.status(200).json({
            message: "게시글 조회 완료했습니다.",
            data: findPost,
            resultCode: true,
          });
        } else {
          return res.status(200).json({
            message: "게시글을 찾을 수 없습니다.",
            resultCode: false,
          });
        }
      } catch (error) {
        console.log(error);
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
