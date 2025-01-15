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
        const spaceUid = req.query.spaceUid as string;
        const pageNumber = parseInt(req.query.page as string);

        const { error: spaceListError } = await supabase.from("spaceList").select("*").eq("UID", uid).single();

        const { data: findSpace, error: spaceError } = await supabase
          .from("space")
          .select("*")
          .eq("UID", spaceUid)
          .single();

        if (spaceListError || spaceError) {
          return res.status(200).json({
            message: "사용자 정보를 찾을 수 없습니다.",
            resultCode: false,
          });
        }

        let whereCondition = [{ recipient_uid: uid }, { sender_uid: uid }];

        if (findSpace.space_manager === uid) {
          whereCondition.push({ recipient_uid: findSpace.UID }, { sender_uid: findSpace.UID });
        }

        const orCondition = whereCondition
          .map((cond) =>
            cond.recipient_uid ? `recipient_uid.eq.${cond.recipient_uid}` : `sender_uid.eq.${cond.sender_uid}`
          )
          .join(",");

        const {
          data: findNotifications,
          count: totalCount,
          error: notificationError,
        } = await supabase
          .from("notifications")
          .select("*", { count: "exact" })
          .or(orCondition)
          .range((pageNumber - 1) * 50, pageNumber * 50 - 1)
          .order("create_date", { ascending: false });

        if (notificationError) {
          if (notificationError.code === "PGRST116") {
            return res.status(200).json({
              message: "사용자 알림 목록 조회 완료했습니다.",
              data: [],
              pageInfo: 0,
              resultCode: true,
            });
          }
          throw notificationError;
        }

        const findName = async (type: string, uid: string) => {
          if (type === "space") {
            const { data: spaceData } = await supabase.from("space").select("space_name").eq("UID", uid).single();
            return spaceData?.space_name;
          } else if (type === "user") {
            const { data: userData } = await supabase.from("emps").select("user_name").eq("UID", uid).single();
            return userData?.user_name;
          }
          return null;
        };

        const notificationsWithName = await Promise.all(
          findNotifications.map(async (notification) => {
            let targetType = "";
            let targetUid = "";
            if (notification.sender_uid === uid) {
              targetType = "space";
              targetUid = notification.recipient_uid;
            } else if (notification.sender_uid === findSpace.UID) {
              targetType = "user";
              targetUid = notification.recipient_uid;
            } else if (notification.recipient_uid === uid) {
              targetType = "space";
              targetUid = notification.sender_uid;
            } else {
              targetType = "user";
              targetUid = notification.sender_uid;
            }

            const name = await findName(targetType, targetUid);
            return {
              ...notification,
              name: name,
            };
          })
        );

        const totalPages = Math.ceil(totalCount ?? 0 / 50);

        const pageInfo = {
          currentPage: pageNumber,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: 50,
        };

        return res.status(200).json({
          message: "사용자 알림 목록 조회 완료했습니다.",
          data: notificationsWithName,
          pageInfo: pageInfo,
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
