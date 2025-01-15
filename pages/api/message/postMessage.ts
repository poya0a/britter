"use server";
import { NextApiResponse } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";
import { v4 as uuidv4 } from "uuid";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
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
          // 토큰 이용하여 UID GET
          const uid = req.user.claims.UID;

          if (uid && fields.recipientUid && fields.message) {
            const recipientUid: string = fields.recipientUid[0];
            const messageText: string = fields.message[0];

            const { error: userError } = await supabase.from("emps").select("*").eq("UID", recipientUid).single();

            if (userError) {
              return res.status(200).json({
                message: "받는 사람 정보를 찾을 수 없습니다.",
                resultCode: false,
              });
            }

            const uuid = uuidv4();

            const message = {
              UID: uuid,
              recipient_uid: recipientUid,
              sender_uid: uid,
              message: messageText,
              confirm: false,
              create_date: new Date(),
            };

            const { error: messageError } = await supabase.from("message").insert(message).single();

            if (messageError) {
              return res.status(200).json({
                message: "메시지 전송에 실패하였습니다.",
                resultCode: false,
              });
            }
            return res.status(200).json({
              message: "메시지가 전송되었습니다.",
              resultCode: true,
            });
          } else {
            return res.status(200).json({
              message: "요청 값이 올바르지 않습니다.",
              resultCode: false,
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
  });
}
