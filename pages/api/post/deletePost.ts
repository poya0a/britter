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

          if (!fields.seq) {
            return res.status(200).json({
              message: "게시글 정보가 올바르지 않습니다.",
              resultCode: false,
            });
          }

          const seq: string = fields.seq[0];

          const currentPost = await postRepository.findOne({
            where: { seq, UID: uid },
          });

          const childPosts = await postRepository.find({
            where: [
              { seq, UID: uid },
              { p_seq: seq, UID: uid },
            ],
          });

          if (!currentPost) {
            return res.status(200).json({
              message: "삭제할 게시글을 찾을 수 없습니다.",
              resultCode: false,
            });
          }

          if (childPosts.length > 0) {
            await postRepository.remove(childPosts);
          }

          let pSeq: string = currentPost?.p_seq || "";

          await postRepository.remove(currentPost);

          // 남은 게시글 재정렬
          const postsWithSamePSeq = await postRepository.find({
            where: { p_seq: pSeq, UID: uid },
          });

          const postsToSort = postsWithSamePSeq.filter(
            (post) => post.order_number
          );

          postsToSort.sort((a, b) => a.order_number - b.order_number);

          for (let i = 0; i < postsToSort.length; i++) {
            postsToSort[i].order_number = i + 1;
            await postRepository.save(postsToSort[i]);
          }

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
