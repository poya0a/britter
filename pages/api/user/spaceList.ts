"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { getDataSource } from "@database/typeorm.config";
import { Space } from "@entities/Space.entity";
import { SpaceList } from "@entities/SpaceList.entity";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@server/utils/authenticateToken";

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
        const dataSource = await getDataSource();
        const spaceListRepository = dataSource.getRepository(SpaceList);

        const findSpaceList = await spaceListRepository.findOne({
          where: { UID: uid },
        });

        if (findSpaceList) {
          const spaceRepository = dataSource.getRepository(Space);

          const foundSpaces = await Promise.all(
            JSON.parse(findSpaceList.space || "[]").map(async (spaceUID: string) => {
              const space = await spaceRepository.findOne({
                where: { UID: spaceUID },
                select: [
                  "UID",
                  "space_profile_seq",
                  "space_name",
                  "space_manager",
                  "space_public",
                  "space_users",
                  "space_content",
                ],
              });
              return space;
            })
          );

          const validSpaces = foundSpaces.filter((space) => space !== null);

          return res.status(200).json({
            message: "사용자 스페이스 목록 조회 완료했습니다.",
            data: validSpaces,
            resultCode: true,
          });
        } else {
          return res.status(200).json({
            message: "사용자 스페이스 목록을 찾을 수 없습니다.",
            resultCode: false,
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
