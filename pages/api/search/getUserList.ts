"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { AppDataSource } from "@database/typeorm.config";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@/server/utils/authenticateToken";
import { ILike } from "typeorm";
import { Emps } from "@entities/Emps.entity";

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
      try {
        const dataSource = await AppDataSource.useFactory();
        const empsRepository = dataSource.getRepository(Emps);
        const [findUser, totalCount] = await empsRepository.findAndCount({
          where: [
            { user_id: ILike(`%${searchWord}%`), user_public: true },
            { user_nick_name: ILike(`%${searchWord}%`), user_public: true },
          ],
          select: [
            "UID",
            "user_profile_seq",
            "user_id",
            "user_name",
            "user_nick_name",
            "user_public",
          ],
          skip: (pageNumber - 1) * 10,
          take: 10,
        });

        if (findUser) {
          const totalPages = Math.ceil(totalCount / 10);

          const pageInfo = {
            currentPage: pageNumber,
            totalPages: totalPages,
            totalItems: totalCount,
            itemsPerPage: 10,
          };

          return res.status(200).json({
            message: "검색 완료했습니다.",
            data: findUser,
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
