"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { getDataSource } from "@database/typeorm.config";
import { Space } from "@entities/Space.entity";
import { Emps } from "@entities/Emps.entity";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@server/utils/authenticateToken";

export default async function handler(
  req: AuthenticatedRequest & NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }
  const { spaceUid, userUid } = JSON.parse(req.body);

  authenticateToken(req, res, async () => {
    if (req.user) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;

      try {
        const dataSource = await getDataSource();
        const spaceRepository = dataSource.getRepository(Space);

        const findSpace = await spaceRepository.findOne({
          where: { UID: spaceUid },
        });

        if (!findSpace) {
          return res.status(200).json({
            message: "스페이스 정보가 올바르지 않습니다.",
            resultCode: false,
          });
        }

        if (findSpace?.space_manager !== uid) {
          return res.status(200).json({
            message: "이관 권한이 없습니다.",
            resultCode: false,
          });
        }

        // 하나 이상의 스페이스에 매니저 권한 필수
        const findSpaceInManager = await spaceRepository.find({
          where: { space_manager: uid },
        });

        if (!findSpaceInManager || findSpaceInManager.length < 2) {
          return res.status(200).json({
            message: "하나 이상의 스페이스에 매니저 권한은 필수입니다.",
            resultCode: false,
          });
        }

        const empsRepository = dataSource.getRepository(Emps);

        const findUser = await empsRepository.findOne({
          where: { UID: userUid },
        });

        if (!findUser) {
          return res.status(200).json({
            message: "사용자 정보가 올바르지 않습니다.",
            resultCode: false,
          });
        }

        const updatedSpaceUsers = [
          ...findSpace.space_users.filter((user) => user !== userUid),
          findSpace.space_manager,
        ];

        findSpace.space_manager = userUid;
        findSpace.space_users = updatedSpaceUsers;

        await spaceRepository.save(findSpace);

        return res.status(200).json({
          message: "스페이스 매니저 이관이 완료되었습니다.",
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
