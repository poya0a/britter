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
        const messageType = req.query.type;
        const pageNumber = parseInt(req.query.page as string);
        const searchWord = req.query.searchWord;

        let query = supabase
          .from("message")
          .select("*", { count: "exact" })
          .eq(messageType === "receivedMessage" ? "recipient_uid" : "sender_uid", uid)
          .range((pageNumber - 1) * 20, pageNumber * 20 - 1)
          .order("create_date", { ascending: false });

        if (searchWord) {
          query = query.ilike("message", `%${searchWord}%`);
        }

        const { data: findMessageList, error: messageError, count: totalCount } = await query;

        if (messageError) {
          if (messageError.code === "PGRST116") {
            return res.status(200).json({
              message: "메시지 목록 조회 완료했습니다.",
              data: [],
              pageInfo: 0,
              unreadMessageCount: null,
              resultCode: true,
            });
          }
          return res.status(200).json({
            message: "메시지 조회에 실패하였습니다.",
            resultCode: false,
            error: messageError,
          });
        }

        const messageListWithName = await Promise.all(
          findMessageList.map(async (message) => {
            const recipientUid = message.sender_uid === uid ? message.recipient_uid : message.sender_uid;

            const { data: empData, error: empError } = await supabase
              .from("emps")
              .select("user_name")
              .eq("UID", recipientUid)
              .single();

            let userName = null;

            if (empError && empError.code !== "PGRST116") {
              throw empError;
            }

            if (empData) {
              userName = empData.user_name;
            }

            return {
              ...message,
              message: message.message.length <= 100 ? message.message : message.message.slice(0, 100) + "...",
              name: userName,
            };
          })
        );

        const totalPages = Math.ceil(totalCount ?? 0 / 20);

        const pageInfo = {
          currentPage: pageNumber,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: 20,
        };

        const { count: unreadMessageTotalCount } = await supabase
          .from("message")
          .select("UID", { count: "exact" })
          .eq("recipient_uid", uid)
          .eq("confirm", false);

        return res.status(200).json({
          message: "메시지 목록 조회 완료했습니다.",
          data: messageListWithName,
          pageInfo: pageInfo,
          unreadMessageCount: unreadMessageTotalCount && unreadMessageTotalCount > 0 ? unreadMessageTotalCount : null,
          resultCode: true,
        });
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
}
