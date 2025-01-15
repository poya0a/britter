"use server";
import { NextApiRequest, NextApiResponse } from "next";
import supabase from "@database/supabase.config";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다.", resultCode: false });
  }
  const { user_name, user_hp, user_certification } = req.body;

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
    const { data: existingUser } = await supabase
      .from("emps")
      .select("user_id")
      .eq("user_name", user_name)
      .eq("user_hp", user_hp)
      .eq("user_certification", user_certification)
      .single();

    if (existingUser) {
      const id = maskId(existingUser.user_id);
      return res.status(200).json({
        message: `아이디는 ${id} 입니다.`,
        resultCode: true,
      });
    }

    return res.status(200).json({ message: "회원 정보가 없습니다.", resultCode: false });
  } catch (error) {
    return res.status(200).json({
      message: "서버 에러가 발생하였습니다.",
      error: error,
      resultCode: false,
    });
  }
}

const maskId = (id: string): string => {
  if (!id) return "";

  const length = id.length;

  if (length <= 2) {
    return id[0] + "*".repeat(length - 1);
  }

  const maskLength = Math.ceil(length / 2);

  const frontLength = Math.floor((length - maskLength) / 2);
  const backLength = length - frontLength - maskLength;

  const maskedId = id.slice(0, frontLength) + "*".repeat(maskLength) + id.slice(length - backLength);

  return maskedId;
};
