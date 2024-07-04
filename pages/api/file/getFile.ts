"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { AppDataSource } from "@database/typeorm.config";
import { File } from "@entities/File.entity";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@/server/utils/authenticateToken";

export default async function handler(
  req: NextApiRequest & AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }
  authenticateToken(req, res, async () => {
    const seqParam = req.query.seq as string;
    if (seqParam) {
      try {
        const dataSource = await AppDataSource.useFactory();
        const fileRepository = dataSource.getRepository(File);
        const findFile = await fileRepository.findOne({
          where: { seq: parseInt(seqParam, 10) },
        });

        if (findFile) {
          return res.status(200).json({
            message: "파일 조회 완료했습니다.",
            data: findFile,
            resultCode: true,
          });
        } else {
          return res.status(200).json({
            message: "파일을 찾을 수 없습니다.",
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
