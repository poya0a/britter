"use server";
import { NextApiResponse, NextApiRequest } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";

export default async function handler(req: NextApiRequest & AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  authenticateToken(req, res, async () => {
    const seqParam = req.query.seq as string;

    if (seqParam) {
      try {
        const { data, error } = await supabase
          .from("file")
          .select("file_path")
          .eq("seq", parseInt(seqParam, 10))
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            return res.status(200).json({
              message: "파일을 찾을 수 없습니다.",
              resultCode: false,
            });
          }
          throw error;
        }

        return res.status(200).json({
          message: "파일 조회 완료했습니다.",
          data: {
            file_path: data.file_path,
          },
          resultCode: true,
        });
      } catch (error) {
        return res.status(500).json({
          message: "서버 에러가 발생하였습니다.",
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
