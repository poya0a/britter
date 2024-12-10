"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { getDataSource } from "@database/typeorm.config";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@server/utils/authenticateToken";
import { Emps } from "@entities/Emps.entity";
import { Notifications } from "@entities/Notifications.entity";

export default async function handler(
  req: AuthenticatedRequest & NextApiRequest,
  res: NextApiResponse
) {
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
        const dataSource = await getDataSource();
        const empsRepository = dataSource.getRepository(Emps);
        const notificationsRepository = dataSource.getRepository(Notifications);
        const findUser = await empsRepository.findOne({
          where:
            searchUid === uid
              ? { UID: searchUid }
              : { UID: searchUid, user_public: true },
          select: [
            "UID",
            "user_profile_seq",
            "user_id",
            "user_name",
            "user_hp",
            "user_email",
            "user_birth",
            "user_public",
            "create_date",
            "status_emoji",
            "status_message",
          ],
        });

        if (!findUser) {
          return res.status(200).json({
            message: "검색 결과가 없습니다.",
            resultCode: true,
          });
        }

        if (spaceUid) {
          const notify = await notificationsRepository.findOne({
            where: [
              {
                notify_type: "space",
                sender_uid: findUser.UID,
                recipient_uid: spaceUid,
              },
              {
                notify_type: "user",
                sender_uid: spaceUid,
                recipient_uid: findUser.UID,
              },
            ],
            select: ["UID", "notify_type"],
          });

          if (notify) {
            const userWithNotification = {
              ...findUser,
              notify: {
                notifyUID: notify.UID,
                notifyType:
                  notify.notify_type === "space" ? "participation" : "invite",
              },
            };
            return res.status(200).json({
              message: "검색 완료했습니다.",
              data: userWithNotification,
              resultCode: true,
            });
          } else {
            return res.status(200).json({
              message: "검색 완료했습니다.",
              data: findUser,
              resultCode: true,
            });
          }
        } else {
          return res.status(200).json({
            message: "검색 완료했습니다.",
            data: findUser,
            resultCode: true,
          });
        }
      } catch (error) {
        console.log(error);
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
