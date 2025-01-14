"use server";
import { NextApiResponse, NextApiRequest } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";

export default async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }
  const { messageUid } = JSON.parse(req.body);

  authenticateToken(req, res, async () => {
    if (req.user) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;

      try {
        const { data: findMessage } = await supabase.from("message").select("*").eq("UID", messageUid).single();

        if (findMessage) {
          if (findMessage.recipient_uid === uid) {
            findMessage.confirm = true;

            const { error: upsertError } = await supabase.from("message").upsert(findMessage);

            if (upsertError) {
              return res.status(200).json({
                message: "메시지는 수신자만 읽음 처리할 수 있습니다.",
                resultCode: false,
              });
            }
          }
          return res.status(200).json({
            message: "메시지 읽음 처리되었습니다.",
            data: { uid: findMessage.UID },
            resultCode: true,
          });
        } else {
          return res.status(200).json({
            message: "삭제된 메시지입니다.",
            resultCode: false,
          });
        }
      } catch (error) {
        return res.status(200).json({
          message: typeof error === "string" ? error : "서버 에러가 발생하였습니다.",
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
