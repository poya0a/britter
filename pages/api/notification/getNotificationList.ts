"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { getDataSource } from "@database/typeorm.config";
import { In, Not } from "typeorm";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@/server/utils/authenticateToken";
import { Notifications } from "@entities/Notifications.entity";
import { Space } from "@entities/Space.entity";
import { SpaceList } from "@entities/SpaceList.entity";
import { Emps } from "@entities/Emps.entity";

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
        const dataSource = await getDataSource();
        const spaceListRepository = dataSource.getRepository(SpaceList);
        const spaceRepository = dataSource.getRepository(Space);

        const findSpaceList = await spaceListRepository.findOne({
          where: { UID: uid },
        });

        if (!findSpaceList || findSpaceList.space.length === 0) {
          return res.status(200).json({
            message: "사용자 정보를 찾을 수 없습니다.",
            resultCode: false,
          });
        }

        const findSpace = await spaceRepository.find({
          where: {
            UID: In(findSpaceList.space),
          },
        });

        const findManagedSpaces = findSpace.filter(
          (space) => space.space_manager === uid
        );

        const notificationsRepository = dataSource.getRepository(Notifications);
        const empsRepository = dataSource.getRepository(Emps);

        const [findNotifications, totalCount] =
          await notificationsRepository.findAndCount({
            where: [
              { recipient_uid: uid },
              {
                sender_uid: uid,
              },
              {
                recipient_uid: In(findManagedSpaces.map((space) => space.UID)),
              },
              {
                sender_uid: In(findManagedSpaces.map((space) => space.UID)),
              },
            ],

            skip: (pageNumber - 1) * 50,
            take: 50,
          });

        const findName = async (type: string, uid: string) => {
          if (type === "space") {
            const find = await spaceRepository.findOne({
              where: { UID: uid },
              select: ["space_name"],
            });
            return find?.space_name;
          } else if (type === "user") {
            const find = await empsRepository.findOne({
              where: { UID: uid },
              select: ["user_name"],
            });
            return find?.user_name;
          }

          return null;
        };

        const notificationsWithName = await Promise.all(
          findNotifications.map(async (notification) => {
            const includedSender =
              notification.sender_uid === uid ||
              findManagedSpaces.some(
                (space) => space.UID === notification.sender_uid
              );

            const name = await findName(
              notification.sender_uid === uid ? "space" : "user",
              includedSender
                ? notification.recipient_uid
                : notification.sender_uid
            );
            return {
              ...notification,
              name: name,
            };
          })
        );

        const totalPages = Math.ceil(totalCount / 50);

        const pageInfo = {
          currentPage: pageNumber,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: 50,
        };

        return res.status(200).json({
          message: "사용자 알림 목록 조회 완료했습니다.",
          data: notificationsWithName ? notificationsWithName : [],
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
