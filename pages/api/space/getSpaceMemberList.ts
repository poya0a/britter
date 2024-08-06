"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { AppDataSource } from "@database/typeorm.config";
import { Space } from "@entities/Space.entity";
import { Emps } from "@entities/Emps.entity";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@/server/utils/authenticateToken";

export default async function handler(
  req: AuthenticatedRequest & NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }
  const { spaceUid, page } = JSON.parse(req.body);
  const pageNumber = parseInt(page, 10);

  authenticateToken(req, res, async () => {
    if (req.user) {
      try {
        const dataSource = await AppDataSource.useFactory();
        const spaceRepository = dataSource.getRepository(Space);

        const findSpace = await spaceRepository.findOne({
          where: { UID: spaceUid },
        });

        if (findSpace) {
          const empsRepository = dataSource.getRepository(Emps);

          const findManager = await empsRepository.findOne({
            where: { UID: findSpace.space_manager },
            select: [
              "UID",
              "user_profile_seq",
              "user_id",
              "user_name",
              "user_hp",
              "user_email",
              "user_nick_name",
              "user_birth",
              "user_public",
              "status_emoji",
              "status_message",
            ],
          });

          const manager = {
            ...findManager,
            roll: "manager",
          };

          if (findSpace.space_users.length > 0) {
            const { paginatedItems, pageInfo } = paginate(
              findSpace.space_users,
              pageNumber,
              10
            );

            const findUsers = await Promise.all(
              paginatedItems.map(async (user) => {
                const userInfo = await empsRepository.findOne({
                  where: { UID: user },
                  select: [
                    "UID",
                    "user_profile_seq",
                    "user_id",
                    "user_name",
                    "user_hp",
                    "user_email",
                    "user_nick_name",
                    "user_birth",
                    "user_public",
                    "status_emoji",
                    "status_message",
                  ],
                });
                return {
                  ...userInfo,
                  roll: "member",
                };
              })
            );

            const spaceUsers = [manager, ...findUsers];
            return res.status(200).json({
              message: "스페이스 멤버를 조회하였습니다.",
              data: spaceUsers,
              pageInfo: pageInfo,
              resultCode: true,
            });
          } else {
            return res.status(200).json({
              message: "스페이스 멤버를 조회하였습니다.",
              data: [manager],
              pageInfo: {
                currentPage: 1,
                totalPages: 1,
                totalItems: 1,
              },
              resultCode: true,
            });
          }
        } else {
          return res.status(200).json({
            message: "스페이스 정보가 올바르지 않습니다.",
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
