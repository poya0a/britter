"use server";
import { NextApiRequest, NextApiResponse } from "next";
import supabase from "@database/supabase.config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "잘못된 메소드입니다.", resultCode: false });
  }

  const { user_email } = req.body;

  if (!user_email) {
    return res
      .status(200)
      .json({ message: "이메일을 입력해 주세요.", resultCode: false });
  }

  try {
    // Supabase에서 이메일 확인
    const { data: existingUser, error } = await supabase
      .from("Emps")
      .select("user_email")
      .eq("user_email", user_email)
      .single();

    if (error) {
      // Supabase에서 발생한 에러 처리
      if (error.code === "PGRST116") {
        // 데이터가 없는 경우
        return res
          .status(200)
          .json({ message: "사용 가능한 이메일입니다.", resultCode: true });
      }
      throw error;
    }

    if (existingUser) {
      return res
        .status(200)
        .json({ message: "이미 사용 중인 이메일입니다.", resultCode: false });
    }

    return res
      .status(200)
      .json({ message: "사용 가능한 이메일입니다.", resultCode: true });
  } catch (error) {
    return res.status(500).json({
      message: "서버 에러가 발생하였습니다.",
      error: error,
      resultCode: false,
    });
  }
}

