"use server";
import { NextApiResponse } from "next";
import { getDataSource } from "@database/typeorm.config";
import { Emps } from "@entities/Emps.entity";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@server/utils/authenticateToken";

export default async function handler(
  req: AuthenticatedRequest,
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
        const empsRepository = dataSource.getRepository(Emps);
        const findUser = await empsRepository.findOne({
          where: { UID: uid },
          select: [
            "UID",
            "user_profile_seq",
            "user_id",
            "user_name",
            "user_hp",
            "user_email",
            "user_birth",
            "user_public",
            "user_level",
            "create_date",
            "status_emoji",
            "status_message",
          ],
        });

        if (findUser) {
          return res.status(200).json({
            message: "사용자 정보 조회 완료했습니다.",
            data: findUser,
            resultCode: true,
          });
        } else {
          return res.status(200).json({
            message: "사용자 정보를 찾을 수 없습니다.",
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
