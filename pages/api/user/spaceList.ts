"use server";
import { NextApiResponse, NextApiRequest } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";

export default async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  authenticateToken(req, res, async () => {
    if (req.user) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;

      try {
        const { data: spaceList, error: spaceListError } = await supabase
          .from("spaceList")
          .select("space")
          .eq("UID", uid)
          .single();

        if (spaceListError) {
          return res.status(200).json({
            message: "스페이스 목록을 찾을 수 없습니다.",
            resultCode: false,
            error: spaceListError,
          });
        }

        if (spaceList) {
          const { data: spaces, error: spacesError } = await supabase
            .from("space")
            .select("UID, space_profile_seq, space_name, space_manager, space_public, space_users, space_content")
            .in("UID", spaceList.space);

          if (spacesError) {
            return res.status(200).json({
              message: "스페이스 정보를 불러올 수 없습니다.",
              resultCode: false,
              error: spacesError,
            });
          }

          return res.status(200).json({
            message: "사용자 스페이스 목록 조회 완료했습니다.",
            data: spaces,
            resultCode: true,
          });
        } else {
          return res.status(200).json({
            message: "사용자 스페이스 목록을 찾을 수 없습니다.",
            resultCode: false,
          });
        }
      } catch (error) {
        return res.status(200).json({
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
