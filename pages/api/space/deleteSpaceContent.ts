"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { getDataSource } from "@database/typeorm.config";
import { Space } from "@entities/Space.entity";
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
  const { spaceUid } = JSON.parse(req.body);

  authenticateToken(req, res, async () => {
    if (req.user) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;

      try {
        const dataSource = await getDataSource();

        if (!spaceUid) {
          return res.status(200).json({
            message: "스페이스 정보를 찾을 수 없습니다. 다시 시도해 주세요.",
            resultCode: false,
          });
        }

        // 저장하는 스페이스에 권한이 있는지 체크
        const spaceRepository = dataSource.getRepository(Space);

        const findSpace = await spaceRepository.findOne({
          where: { UID: spaceUid },
        });

        if (findSpace) {
          if (
            findSpace.space_manager === uid ||
            findSpace.space_users.includes(uid)
          ) {
            findSpace.space_content = null;

            await spaceRepository.save(findSpace);

            return res.status(200).json({
              message: "콘텐츠가 삭제되었습니다.",
              data: { uid: findSpace.UID },
              resultCode: true,
            });
          } else {
            return res.status(200).json({
              message: "콘텐츠 삭제 권한이 없습니다.",
              resultCode: false,
            });
          }
        } else {
          return res.status(200).json({
            message: "스페이스 정보를 찾을 수 없습니다. 다시 시도해 주세요.",
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
