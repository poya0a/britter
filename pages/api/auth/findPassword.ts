"use server";
import { NextApiRequest, NextApiResponse } from "next";
import supabase from "@database/supabase.config";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다.", resultCode: false });
  }
  const { user_id, user_name, user_hp, user_certification } = req.body;

  if (!user_id) {
    return res.status(200).json({ message: "아이디를 입력해 주세요.", resultCode: false });
  }

  if (!user_name) {
    return res.status(200).json({ message: "이름을 입력해 주세요.", resultCode: false });
  }

  if (!user_hp) {
    return res.status(200).json({ message: "전화번호를 입력해 주세요.", resultCode: false });
  }

  if (!user_certification) {
    return res.status(200).json({ message: "전화번호를 인증해 주세요.", resultCode: false });
  }

  try {
    const { error } = await supabase
      .from("emps")
      .select("user_certification")
      .eq("user_id", user_id)
      .eq("user_name", user_name)
      .eq("user_hp", user_hp)
      .eq("user_certification", user_certification)
      .single();

    if (error) {
      return res.status(200).json({ message: "회원 정보가 없습니다.", resultCode: false });
    }

    return res.status(200).json({
      message: "비밀번호를 재설정해 주세요.",
      resultCode: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "서버 에러가 발생하였습니다.",
      error: error,
      resultCode: false,
    });
  }
}
