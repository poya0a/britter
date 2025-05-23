"use server";
import { NextApiResponse, NextApiRequest } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";

export default async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  authenticateToken(req, res, async () => {
    if (req.user) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;

      try {
        const messageUid = req.query.messageUid;

        if (messageUid && typeof messageUid === "string" && messageUid !== "") {
          const { data: findMessage, error } = await supabase
            .from("message")
            .select("*")
            .eq("UID", messageUid)
            .single();

          if (error) {
            return res.status(200).json({
              message: "메시지 조회 실패하였습니다.",
              resultCode: false,
            });
          }

          const { data: findName } = await supabase
            .from("emps")
            .select("user_name")
            .eq("UID", findMessage.sender_uid === uid ? findMessage.recipient_uid : findMessage.sender_uid)
            .single();

          let userName = null;

          if (findName) {
            userName = findName.user_name;
          }

          const messageListWithName = {
            ...findMessage,
            name: userName,
          };

          return res.status(200).json({
            message: "메시지 조회 완료했습니다.",
            data: messageListWithName,
            resultCode: true,
          });
        } else {
          return res.status(200).json({
            message: "메시지 정보가 올바르지 않습니다.",
            resultCode: false,
          });
        }
      } catch (error) {
        return res.status(500).json({
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
