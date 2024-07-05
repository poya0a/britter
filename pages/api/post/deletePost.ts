"use server";
import { NextApiResponse } from "next";
import { AppDataSource } from "@database/typeorm.config";
import { Post } from "@/server/entities/Post.entity";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@/server/utils/authenticateToken";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }
  authenticateToken(req, res, async () => {
    const form = formidable({});

    form.parse(req, async (err, fields) => {
      if (err) {
        return res.status(500).json({
          message: err,
          resultCode: false,
        });
      }
      if (req.user) {
        // 토큰 이용하여 UID GET
        const uid = req.user.claims.UID;
        try {
          const dataSource = await AppDataSource.useFactory();
          const postRepository = dataSource.getRepository(Post);

          let seq: string = "";
          if (fields.seq) {
            seq = fields.seq[0];
          }

          const posts = await postRepository.find({
            where: [
              { seq: seq, UID: uid },
              { p_seq: seq, UID: uid },
            ],
          });

          if (posts.length === 0) {
            return res.status(200).json({
              message: "삭제할 게시글을 찾을 수 없습니다.",
              resultCode: false,
            });
          }

          let pSeq: string = "";
          console.log(fields.p_seq);
          if (fields.p_seq) {
            pSeq = fields.p_seq[0];
            console.log(fields.p_seq[0]);
          }

          await postRepository.remove(posts);

          return res.status(200).json({
            message: "게시글이 삭제되었습니다.",
            data: { seq: pSeq },
            resultCode: true,
          });
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
  });
}
