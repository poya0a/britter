"use server";
import { NextApiRequest, NextApiResponse } from "next";
import supabase from "@database/supabase.config";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다.", resultCode: false });
  }
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(200).json({ message: "아이디를 입력해 주세요.", resultCode: false });
  }

  try {
    const { data: existingUser, error } = await supabase.from("emps").select("user_id").eq("user_id", user_id).single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(200).json({ message: "사용 가능한 아이디입니다.", resultCode: true });
      }
      throw error;
    }

    if (existingUser) {
      return res.status(200).json({ message: "이미 사용 중인 아이디입니다.", resultCode: false });
    } else {
      return res.status(200).json({ message: "사용 가능한 아이디입니다.", resultCode: true });
    }
  } catch (error) {
    return res.status(200).json({
      message: "서버 에러가 발생하였습니다.",
      error: error,
      resultCode: false,
    });
  }
}
