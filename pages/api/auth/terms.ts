"use server";
import { NextApiRequest, NextApiResponse } from "next";
import supabase from "@database/supabase.config";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  try {
    const { data: terms, error } = await supabase.from("terms").select("*").eq("in_used", true);

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(200).json({
          message: "이용약관 조회 완료했습니다.",
          data: [],
          resultCode: true,
        });
      }
      throw error;
    }

    return res.status(200).json({
      message: "이용약관 조회 완료했습니다.",
      data: terms,
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
