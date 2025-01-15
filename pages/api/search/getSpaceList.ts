"use server";
import { NextApiResponse, NextApiRequest } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";

export default async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  const { searchWord, page } = JSON.parse(req.body);
  const pageNumber = parseInt(page, 10);

  authenticateToken(req, res, async () => {
    if (req.user) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;

      try {
        // Space와 Notifications 테이블에서 데이터 조회
        const { data: findSpace, count: totalCount } = await supabase
          .from("space")
          .select("UID, space_profile_seq, space_name, space_public, space_manager, space_users", { count: "exact" })
          .ilike("space_name", `%${searchWord}%`)
          .range((pageNumber - 1) * 10, pageNumber * 10 - 1);

        if (findSpace) {
          // 알림 정보 조회
          const spaceWithNotification = await Promise.all(
            findSpace.map(async (space) => {
              const { data: userNotification } = await supabase
                .from("notifications")
                .select("UID, notify_type")
                .or(
                  `and(notify_type.eq.user,sender_uid.eq.${space.UID},recipient_uid.eq.${uid}),and(notify_type.eq.space,sender_uid.eq.${uid},recipient_uid.eq.${space.UID})`
                )
                .single();

              if (userNotification) {
                const notify = {
                  notifyUID: userNotification.UID,
                  notifyType: userNotification.notify_type === "space" ? "participation" : "invite",
                };

                return {
                  ...space,
                  notify,
                };
              } else {
                return space;
              }
            })
          );

          const totalPages = Math.ceil(findSpace.length / 10);

          const pageInfo = {
            currentPage: pageNumber,
            totalPages: totalPages,
            totalItems: totalCount,
            itemsPerPage: 10,
          };

          return res.status(200).json({
            message: "검색 완료했습니다.",
            data: spaceWithNotification,
            pageInfo: pageInfo,
            resultCode: true,
          });
        } else {
          return res.status(200).json({
            message: "검색 결과가 없습니다.",
            data: [],
            pageInfo: 0,
            resultCode: true,
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
