"use server";
import { NextApiRequest, NextApiResponse } from "next";
import supabase from "@database/supabase.config";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다.", resultCode: false });
  }

  const { user_hp, verify_number } = req.body;

  if (!user_hp) {
    return res.status(200).json({ message: "휴대전화 번호를 입력해 주세요.", resultCode: false });
  }

  if (!verify_number) {
    return res.status(200).json({ message: "인증 번호를 입력해 주세요.", resultCode: false });
  }

  try {
    const { data: existingCertification, error: findError } = await supabase
      .from("certification")
      .select("seq, user_hp, certification_number, create_date")
      .eq("user_hp", user_hp)
      .single();

    if (findError) {
      if (findError.code === "PGRST116") {
        return res.status(200).json({
          message: "인증 번호 받기 버튼을 눌러주세요.",
          resultCode: false,
        });
      }
      throw findError;
    }

    const passedThreeMinutes = isThreeMinutesPassed(existingCertification.create_date);
    if (passedThreeMinutes) {
      return res.status(200).json({
        message: "인증 시간이 만료되었습니다.",
        resultCode: false,
      });
    }

    if (verify_number !== existingCertification.certification_number) {
      return res.status(200).json({
        message: "인증 정보가 올바르지 않습니다.",
        resultCode: false,
      });
    }

    const certificationNumber = uuidv4();
    const { error: updateError } = await supabase
      .from("certification")
      .update({
        certification_number: certificationNumber,
        modify_date: new Date(),
      })
      .eq("user_hp", user_hp);

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({
      message: "인증이 완료되었습니다.",
      data: { certification_number: existingCertification.seq },
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

function isThreeMinutesPassed(date: string) {
  const now = new Date();
  const createDate = new Date(date);

  const diffMilliseconds = now.getTime() - createDate.getTime();
  const threeMinutesInMilliseconds = 3 * 60 * 1000;

  return diffMilliseconds >= threeMinutesInMilliseconds;
}
