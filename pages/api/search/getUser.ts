"use server";
import { NextApiResponse, NextApiRequest } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";

export default async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  authenticateToken(req, res, async () => {
    const spaceUid = req.query.spaceUid as string;
    const searchUid = req.query.searchUid as string;

    if (req.user && searchUid) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;
      try {
        // Emps와 Notifications 테이블에서 데이터 조회
        const { data: findUser, error: userError } = await supabase
          .from("emps")
          .select(
            "UID, user_profile_seq, user_id, user_name, user_hp, user_email, user_birth, user_public, create_date, status_emoji, status_message"
          )
          .eq("UID", searchUid)
          .or(`UID.eq.${uid},user_public.eq.true`)
          .single();

        if (userError) {
          if (userError.code === "PGRST116") {
            return res.status(200).json({
              message: "사용자를 찾을 수 없습니다.",
              resultCode: true,
            });
          }
          throw userError;
        }

        if (spaceUid) {
          const { data: notify } = await supabase
            .from("notifications")
            .select("UID, notify_type")
            .or(
              `and(notify_type.eq.space,sender_uid.eq.${findUser.UID},recipient_uid.eq.${spaceUid}),and(notify_type.eq.user,sender_uid.eq.${spaceUid},recipient_uid.eq.${findUser.UID})`
            )
            .single();

          if (notify) {
            const userWithNotification = {
              ...findUser,
              notify: {
                notifyUID: notify.UID,
                notifyType: notify.notify_type === "space" ? "participation" : "invite",
              },
            };
            return res.status(200).json({
              message: "검색 완료했습니다.",
              data: userWithNotification,
              resultCode: true,
            });
          }
        }
        return res.status(200).json({
          message: "검색 완료했습니다.",
          data: findUser,
          resultCode: true,
        });
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
