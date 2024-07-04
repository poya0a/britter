"use server";
import { FindOneOptions, FindOperator } from "typeorm";
import { NextApiResponse } from "next";
import { AppDataSource } from "@database/typeorm.config";
import { Emps } from "@entities/Emps.entity";
import { Private } from "@entities/Private.entity";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@/server/utils/authenticateToken";

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ message: "잘못된 메소드입니다.", resultCode: false });
  }
  authenticateToken(req, res, async () => {
    if (req.user) {
      try {
        const dataSource = await AppDataSource.useFactory();
        const empsRepository = dataSource.getRepository(Emps);

        // 토큰 이용하여 UID GET
        const uid = req.user.claims.UID;

        const findUser = await empsRepository.findOne({ where: { UID: uid } });

        if (findUser) {
          const privateRepository = dataSource.getRepository(Private);

          const findPrivate = await privateRepository.findOne({
            where: {
              seq: findUser.private_seq as
                | number
                | FindOperator<number>
                | null
                | undefined,
            } as FindOneOptions<Private>["where"],
          });

          if (!findPrivate) {
            return res.status(200).json({
              message: "사용자 정보를 찾을 수 없습니다.",
              resultCode: false,
            });
          }

          findUser.private_seq = null;
          await empsRepository.save(findUser);

          await privateRepository.remove(findPrivate);

          return res.status(200).json({
            message: "로그아웃되었습니다.",
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
