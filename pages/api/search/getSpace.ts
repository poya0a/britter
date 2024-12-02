"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { getDataSource } from "@database/typeorm.config";
import { Space } from "@entities/Space.entity";
import { Notifications } from "@/server/entities/Notifications.entity";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@/server/utils/authenticateToken";

export default async function handler(
  req: AuthenticatedRequest & NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  authenticateToken(req, res, async () => {
    const searchUid = req.query.searchUid as string;
    if (req.user && searchUid) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;

      try {
        const dataSource = await getDataSource();
        const spaceRepository = dataSource.getRepository(Space);
        const notificationsRepository = dataSource.getRepository(Notifications);

        const findSpace = await spaceRepository.findOne({
          where: { UID: searchUid },
          select: [
            "UID",
            "space_profile_seq",
            "space_name",
            "space_public",
            "space_manager",
            "space_users",
          ],
        });

        if (findSpace) {
          const notify = await notificationsRepository.findOne({
            where: [
              {
                notify_type: "user",
                sender_uid: findSpace.UID,
                recipient_uid: uid,
              },
              {
                notify_type: "space",
                sender_uid: uid,
                recipient_uid: findSpace.UID,
              },
            ],
            select: ["UID", "notify_type"],
          });

          if (notify) {
            const spaceWithNotification = {
              ...findSpace,
              notify: {
                notifyUID: notify.UID,
                notifyType:
                  notify.notify_type === "space" ? "participation" : "invite",
              },
            };

            return res.status(200).json({
              message: "검색 완료했습니다.",
              data: spaceWithNotification,
              resultCode: true,
            });
          } else {
            return res.status(200).json({
              message: "검색 완료했습니다.",
              data: findSpace,
              resultCode: true,
            });
          }
        } else {
          return res.status(200).json({
            message: "검색 결과가 없습니다.",
            resultCode: true,
          });
        }
      } catch (error) {
        return res.status(500).json({
          message:
            typeof error === "string" ? error : "서버 에러가 발생하였습니다.",
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
