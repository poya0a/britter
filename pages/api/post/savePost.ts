"use server";
import { NextApiResponse } from "next";
import { AppDataSource } from "@database/typeorm.config";
import { v4 as uuidv4 } from "uuid";
import { DeepPartial } from "typeorm";
import { Post } from "@entities/Post.entity";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@/server/utils/authenticateToken";
import formidable from "formidable";
import { extractImgDataSeq } from "@/server/utils/extractImgDataSeq";
import { handleFileDelete } from "@/server/utils/fileDelete";

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
    return res
      .status(405)
      .json({ message: "잘못된 메소드입니다.", resultCode: false });
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
        try {
          const dataSource = await AppDataSource.useFactory();
          const postRepository = dataSource.getRepository(Post);

          // 토큰 이용하여 UID GET
          const uid = req.user.claims.UID;

          var pSeq: string = "";
          var orderNumber: number = 0;

          // 부모 페이지가 있는 경우
          if (fields.p_seq) {
            pSeq = fields.p_seq[0];

            const parent = await postRepository.find({
              where: {
                p_seq: fields.p_seq[0],
              },
            });

            orderNumber = parent.length;
          } else {
            // 부모 페이지가 없고 새 페이지일 때
            const parent = await postRepository.find({
              where: {
                p_seq: "",
              },
            });
            orderNumber = parent.length;
          }

          var spaceUid: string = "";

          if (fields.space) {
            spaceUid = fields.space[0];
          }

          var title: string = "";

          if (fields.title) {
            title = fields.title[0];
          }

          var content: string = "";

          if (fields.content) {
            content = fields.content[0];
          }

          if (fields.seq) {
            const existingPost = await postRepository.findOne({
              where: { seq: fields.seq[0] },
            });

            if (existingPost) {
              const existingSeqList = extractImgDataSeq(existingPost.content);
              const newSeqList = extractImgDataSeq(content);
              const toDeleteSeqList = existingSeqList.filter(
                (seq) => !newSeqList.includes(seq)
              );

              if (toDeleteSeqList.length > 0) {
                for (const seq of toDeleteSeqList) {
                  await handleFileDelete(seq);
                }
              }

              existingPost.title = title;
              existingPost.content = content;
              existingPost.modify_date = new Date();

              const updatedPost = await postRepository.save(existingPost);

              if (updatedPost) {
                return res.status(200).json({
                  message: "저장되었습니니다.",
                  data: { seq: fields.seq[0] },
                  resultCode: true,
                });
              } else {
                return res.status(200).json({
                  message: "저장에 실패하였습니니다.",
                  resultCode: false,
                });
              }
            } else {
              return res.status(200).json({
                message: "일치하는 게시글을 찾을 수 없습니다.",
                resultCode: false,
              });
            }
          } else {
            const uuid = uuidv4();
            const post: DeepPartial<Post> = {
              seq: uuid,
              p_seq: pSeq,
              UID: uid,
              title: title,
              content: content,
              create_date: new Date(),
              order_number: orderNumber,
              space_uid: spaceUid,
            };

            const newPost = postRepository.create(post);

            const savePost = await postRepository.save(newPost);

            if (savePost) {
              return res.status(200).json({
                message: "저장되었습니니다.",
                data: { seq: uuid },
                resultCode: true,
              });
            } else {
              return res.status(200).json({
                message: "저장에 실패하였습니니다.",
                resultCode: false,
              });
            }
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
  });
}
