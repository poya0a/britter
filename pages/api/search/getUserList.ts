"use server";
import { NextApiResponse, NextApiRequest } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";

export default async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }
  const { spaceUid, searchWord, page } = JSON.parse(req.body);
  const pageNumber = parseInt(page, 10);

  authenticateToken(req, res, async () => {
    if (req.user) {
      try {
        // 사용자 검색
        const { data: findUser, count: totalCount } = await supabase
          .from("emps")
          .select("UID, user_profile_seq, user_id, user_name, user_public", { count: "exact" })
          .or(`user_id.ilike.%${searchWord}%,user_name.ilike.%${searchWord}%`)
          .range((pageNumber - 1) * 10, pageNumber * 10 - 1);

        if (findUser) {
          // 알림 조회 및 사용자와 결합
          const userWithNotification = await Promise.all(
            findUser.map(async (user) => {
              const uid = spaceUid;

              const { data: userNotification } = await supabase
                .from("notifications")
                .select("UID, notify_type")
                .or(
                  `and(notify_type.eq.space,sender_uid.eq.${user.UID},recipient_uid.eq.${uid}),and(notify_type.eq.user,sender_uid.eq.${uid},recipient_uid.eq.${user.UID})`
                )
                .single();

              if (userNotification) {
                const notify = {
                  notifyUID: userNotification.UID,
                  notifyType: userNotification.notify_type === "space" ? "participation" : "invite",
                };

                return {
                  ...user,
                  notify,
                };
              } else {
                return user;
              }
            })
          );

          // 페이지 정보 계산
          const totalPages = Math.ceil(findUser.length / 10);

          const pageInfo = {
            currentPage: pageNumber,
            totalPages: totalPages,
            totalItems: totalCount,
            itemsPerPage: 10,
          };

          return res.status(200).json({
            message: "검색 완료했습니다.",
            data: userWithNotification,
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
