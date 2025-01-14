import { NextApiRequest, NextApiResponse } from "next";
import supabase from "@database/supabase.config";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "@server/provider/jwtProvider";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "잘못된 메소드입니다.", resultCode: false });
  }

  try {
    const refreshTokenHeader = req.headers["refresh-token"];

    if (!refreshTokenHeader) {
      return res.status(200).json({ message: "토큰이 없습니다.", resultCode: false });
    }

    const user = verifyRefreshToken(refreshTokenHeader.toString());

    if (!user) {
      return res.status(200).json({
        message: "유효하지 않거나 만료된 토큰입니다.",
        resultCode: false,
      });
    }

    const { data: existingUser, error } = await supabase.from("emps").select("*").eq("user_id", user.user_id).single();

    if (error || !existingUser) {
      return res.status(404).json({
        message: "일치하는 사용자 정보가 없습니다.",
        resultCode: false,
      });
    }

    const accessToken = createAccessToken({
      UID: user.UID,
      user_id: user.user_id,
    });

    const refreshToken = createRefreshToken({
      UID: user.UID,
      user_id: user.user_id,
    });

    return res.status(200).json({ resultCode: true, accessToken, refreshToken });
  } catch (error) {
    return res.status(200).json({
      message: "서버 에러가 발생하였습니다.",
      error: error,
      resultCode: false,
    });
  }
}
