"use server";
import { NextApiRequest, NextApiResponse } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";

export default async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  authenticateToken(req, res, async () => {
    const postSeq = req.query.postSeq as string;

    if (req.user && postSeq) {
      try {
        // 게시글 조회
        const { data: findPost, error: postError } = await supabase
          .from("posts")
          .select("*")
          .eq("seq", postSeq)
          .single();

        if (postError) {
          return res.status(200).json({
            message: "서버 에러가 발생하였습니다.",
            error: postError,
            resultCode: false,
          });
        }

        if (findPost) {
          return res.status(200).json({
            message: "게시글 조회 완료했습니다.",
            data: findPost,
            resultCode: true,
          });
        } else {
          return res.status(200).json({
            message: "게시글을 찾을 수 없습니다.",
            resultCode: false,
          });
        }
      } catch (error) {
        return res.status(200).json({
          message: typeof error === "string" ? error : "서버 에러가 발생하였습니다.",
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
