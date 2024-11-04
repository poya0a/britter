"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { getDataSource } from "@database/typeorm.config";
import { Space } from "@entities/Space.entity";
import { Notifications } from "@/server/entities/Notifications.entity";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@/server/utils/authenticateToken";
import { ILike } from "typeorm";

export default async function handler(
  req: AuthenticatedRequest & NextApiRequest,
  res: NextApiResponse
) {
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
        const dataSource = await getDataSource();
        const spaceRepository = dataSource.getRepository(Space);
        const notificationsRepository = dataSource.getRepository(Notifications);

        const [findSpace, totalCount] = await spaceRepository.findAndCount({
          where: { space_name: ILike(`%${searchWord}%`) },
          select: [
            "UID",
            "space_profile_seq",
            "space_name",
            "space_public",
            "space_manager",
          ],
          skip: (pageNumber - 1) * 10,
          take: 10,
        });

        if (findSpace) {
          const spaceWithNotification = await Promise.all(
            findSpace.map(async (space) => {
              const userNotification = await notificationsRepository.findOne({
                where: [
                  {
                    notify_type: "user",
                    sender_uid: space.UID,
                    recipient_uid: uid,
                  },
                  {
                    notify_type: "space",
                    sender_uid: uid,
                    recipient_uid: space.UID,
                  },
                ],
                select: ["UID", "notify_type"],
              });

              if (userNotification) {
                const notify = {
                  notifyUID: userNotification.UID,
                  notifyType:
                    userNotification.notify_type === "space"
                      ? "participation"
                      : "invite",
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

          const totalPages = Math.ceil(totalCount / 10);

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
