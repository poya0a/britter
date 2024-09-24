"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { AppDataSource } from "@database/typeorm.config";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@/server/utils/authenticateToken";
import { Notifications } from "@entities/Notifications.entity";

export default async function handler(
  req: AuthenticatedRequest & NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  authenticateToken(req, res, async () => {
    if (req.user) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;

      try {
        const pageNumber = parseInt(req.query.page as string);
        const dataSource = await AppDataSource.useFactory();
        const notificationsListRepository =
          dataSource.getRepository(Notifications);

        const [findNotifications, totalCount] =
          await notificationsListRepository.findAndCount({
            where: [{ recipient_uid: uid }, { sender_uid: uid }],
            skip: (pageNumber - 1) * 10,
            take: 10,
          });

        const totalPages = Math.ceil(totalCount / 10);

        const pageInfo = {
          currentPage: pageNumber,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: 10,
        };

        return res.status(200).json({
          message: "사용자 알림 목록 조회 완료했습니다.",
          data: findNotifications ? findNotifications : [],
          pageInfo: pageInfo,
          resultCode: true,
        });
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
