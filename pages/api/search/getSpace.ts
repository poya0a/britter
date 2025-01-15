"use server";
import { NextApiResponse, NextApiRequest } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";

export default async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  authenticateToken(req, res, async () => {
    const searchUid = req.query.searchUid as string;
    if (req.user && searchUid) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;

      try {
        // Space와 Notifications 테이블에서 데이터 조회
        const { data: findSpace, error: spaceError } = await supabase
          .from("space")
          .select("UID, space_profile_seq, space_name, space_public, space_manager, space_users, space_content")
          .eq("UID", searchUid)
          .single();

        if (spaceError) {
          if (spaceError.code === "PGRST116") {
            return res.status(200).json({
              message: "스페이스를 찾을 수 없습니다.",
              resultCode: true,
            });
          }
          throw spaceError;
        }

        // 알림 정보 조회
        const { data: notify } = await supabase
          .from("notifications")
          .select("UID, notify_type")
          .or(
            `and(notify_type.eq.user,sender_uid.eq.${findSpace.UID},recipient_uid.eq.${uid}),and(notify_type.eq.space,sender_uid.eq.${uid},recipient_uid.eq.${findSpace.UID})`
          )
          .single();

        if (notify) {
          const spaceWithNotification = {
            ...findSpace,
            notify: {
              notifyUID: notify.UID,
              notifyType: notify.notify_type === "space" ? "participation" : "invite",
            },
          };

          return res.status(200).json({
            message: "검색 완료했습니다.",
            data: spaceWithNotification,
            resultCode: true,
          });
        }
        return res.status(200).json({
          message: "검색 완료했습니다.",
          data: findSpace,
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
