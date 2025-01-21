"use server";
import { NextApiResponse, NextApiRequest } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";

export default async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "잘못된 메소드입니다.", resultCode: false });
  }

  authenticateToken(req, res, async () => {
    if (req.user) {
      // UID를 토큰에서 추출
      const uid = req.user.claims.UID;
      try {
        const spaceUid = req.query.spaceUid;
        // Supabase에서 사용자 조회
        const { data: user, error: userError } = await supabase
          .from("emps")
          .select("UID, private_seq")
          .eq("UID", uid)
          .single();

        if (userError || !user) {
          return res.status(200).json({
            message: "사용자 정보를 찾을 수 없습니다.",
            resultCode: false,
          });
        }

        // private_seq가 있을 경우, private 정보 삭제
        if (user.private_seq) {
          const { data: privateData, error: privateError } = await supabase
            .from("private")
            .select("*")
            .eq("seq", user.private_seq)
            .single();

          if (privateError || !privateData) {
            return res.status(200).json({
              message: "사용자 정보를 찾을 수 없습니다.",
              resultCode: false,
            });
          }

          // private_seq null로 업데이트
          const { error: updateUserError } = await supabase.from("emps").update({ private_seq: null }).eq("UID", uid);

          if (updateUserError) {
            return res.status(200).json({
              message: "사용자 정보 업데이트 중 오류가 발생하였습니다.",
              resultCode: false,
            });
          }

          // private 정보 삭제
          const { error: deletePrivateError } = await supabase.from("private").delete().eq("seq", user.private_seq);

          if (deletePrivateError) {
            return res.status(200).json({
              message: "개인 키 삭제 중 오류가 발생하였습니다.",
              resultCode: false,
            });
          }

          // 최근 방문한 스페이스 uid 저장
          const recentSpaceUid =
            !spaceUid || spaceUid === "null" || spaceUid === "undifined" || spaceUid === "" ? null : spaceUid;

          const { error: recentSpaceError } = await supabase
            .from("emps")
            .update({ recent_space: recentSpaceUid })
            .eq("UID", uid);

          if (recentSpaceError) {
            return res.status(200).json({
              message: "최근 방문한 스페이스 정보 업데이트 중 오류가 발생하였습니다.",
              resultCode: false,
            });
          }

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
