import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import supabase from "@database/supabase.config";
import generateDeviceUUID from "@server/utils/generateDeviceUUID";
import { createAccessToken, createRefreshToken } from "@server/provider/jwtProvider";
import { decryptData } from "@server/utils/crytoService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다.", resultCode: false });
  }

  const { user_id, user_pw } = req.body;
  const deviceId = generateDeviceUUID({
    userAgent: req.headers["user-agent"],
  });

  if (!user_id || !user_pw) {
    const name = !user_id ? "아이디" : "비밀번호";
    return res.status(200).json({ message: `${name}를 입력해 주세요.`, resultCode: false });
  }

  try {
    // Supabase에서 device_id로 개인 키 조회
    const { data: existingPrivate, error: privateError } = await supabase
      .from("private")
      .select("private_key, seq")
      .eq("device_id", deviceId)
      .single();

    if (privateError || !existingPrivate) {
      return res.status(200).json({
        message: "디바이스에 해당하는 개인 키가 없습니다.",
        resultCode: false,
      });
    }

    // 개인 키로 아이디와 비밀번호 복호화
    const decryptedUserId = decryptData(user_id, existingPrivate.private_key);
    const decryptedUserPw = decryptData(user_pw, existingPrivate.private_key);

    // Supabase에서 사용자 조회
    const { data: user, error: userError } = await supabase
      .from("emps")
      .select("UID, user_id, user_pw")
      .eq("user_id", decryptedUserId.split('"').join(""))
      .single();

    if (userError || !user) {
      return res.status(200).json({
        message: "아이디 혹은 비밀번호를 확인해 주세요.",
        resultCode: false,
      });
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(decryptedUserPw.split('"').join(""), user.user_pw);

    if (!isPasswordValid) {
      return res.status(200).json({
        message: "아이디 혹은 비밀번호를 확인해 주세요.",
        resultCode: false,
      });
    }

    // JWT 토큰 생성
    const accessToken = createAccessToken({
      UID: user.UID,
      user_id: user.user_id,
    });
    const refreshToken = createRefreshToken({
      UID: user.UID,
      user_id: user.user_id,
    });

    // 사용자 정보 업데이트 (private_seq 추가)
    const { error: updateError } = await supabase
      .from("emps")
      .update({ private_seq: existingPrivate.seq })
      .eq("UID", user.UID);

    if (updateError) {
      return res.status(500).json({
        message: "사용자 정보 업데이트 중 오류가 발생하였습니다.",
        resultCode: false,
      });
    }

    return res.status(200).json({ resultCode: true, accessToken, refreshToken });
  } catch (error) {
    return res.status(500).json({
      message: "서버 에러가 발생하였습니다.",
      error: error,
      resultCode: false,
    });
  }
}
