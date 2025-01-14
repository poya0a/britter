"use server";
import { NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";
import formidable from "formidable";
import { extractImgDataSeq } from "@server/utils/extractImgDataSeq";
import { handleFileDelete } from "@server/utils/fileDelete";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다.", resultCode: false });
  }

  authenticateToken(req, res, async () => {
    const form = formidable({});

    form.parse(req, async (err, fields) => {
      if (err) {
        return res.status(200).json({
          message: err,
          resultCode: false,
        });
      }
      if (req.user) {
        try {
          const uid = req.user.claims.UID;

          let spaceUid = fields.space ? fields.space[0] : "";
          const { data: space, error: spaceError } = await supabase
            .from("spaces")
            .select("*")
            .eq("UID", spaceUid)
            .single();

          if (spaceError || !space) {
            return res.status(200).json({
              message: "스페이스 정보를 찾을 수 없습니다. 다시 시도해 주세요.",
              resultCode: false,
            });
          }

          if (space.space_manager !== uid && !space.space_users.includes(uid)) {
            return res.status(200).json({
              message: "게시글 작성 권한이 없습니다.",
              resultCode: false,
            });
          }

          let pSeq = fields.p_seq ? fields.p_seq[0] : "";
          let orderNumber = 0;

          if (pSeq) {
            const { data: parentPosts, error: parentError } = await supabase
              .from("posts")
              .select("*")
              .eq("p_seq", pSeq);

            if (parentError) {
              return res.status(200).json({
                message: "부모 게시글을 찾을 수 없습니다.",
                resultCode: false,
              });
            }

            orderNumber = parentPosts.length;
          } else {
            const { data: topPosts, error: topError } = await supabase.from("posts").select("*").eq("p_seq", "");

            if (topError) {
              return res.status(200).json({
                message: "최상위 게시글을 찾을 수 없습니다.",
                resultCode: false,
              });
            }

            orderNumber = topPosts.length;
          }

          const title = fields.title ? fields.title[0] : "";
          const content = fields.content ? fields.content[0] : "";

          if (fields.seq) {
            const { data: existingPost, error: existingPostError } = await supabase
              .from("posts")
              .select("*")
              .eq("seq", fields.seq[0])
              .single();

            if (existingPostError || !existingPost) {
              return res.status(200).json({
                message: "일치하는 게시글을 찾을 수 없습니다.",
                resultCode: false,
              });
            }

            const existingSeqList = extractImgDataSeq(existingPost.content);
            const newSeqList = extractImgDataSeq(content);
            const toDeleteSeqList = existingSeqList.filter((seq) => !newSeqList.includes(seq));

            if (toDeleteSeqList.length > 0) {
              for (const seq of toDeleteSeqList) {
                await handleFileDelete(seq);
              }
            }

            const { error: updateError } = await supabase
              .from("posts")
              .update({
                UID: uid,
                title,
                content,
                modify_date: new Date(),
              })
              .eq("seq", fields.seq[0]);

            if (updateError) {
              return res.status(200).json({
                message: "게시글 수정에 실패하였습니다.",
                resultCode: false,
              });
            }

            return res.status(200).json({
              message: "저장되었습니다.",
              data: { seq: fields.seq[0] },
              resultCode: true,
            });
          } else {
            const newPostSeq = uuidv4();
            const { error: insertError } = await supabase.from("posts").insert([
              {
                seq: newPostSeq,
                p_seq: pSeq,
                UID: uid,
                title,
                content,
                create_date: new Date(),
                order_number: orderNumber,
                space_uid: spaceUid,
              },
            ]);

            if (insertError) {
              return res.status(200).json({
                message: "게시글 저장에 실패하였습니다.",
                resultCode: false,
              });
            }

            return res.status(200).json({
              message: "저장되었습니다.",
              data: { seq: newPostSeq },
              resultCode: true,
            });
          }
        } catch (error) {
          return res.status(200).json({
            message: typeof error === "string" ? error : "서버 에러가 발생하였습니다.",
            error,
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
