"use server";
import { NextApiRequest, NextApiResponse } from "next";
import supabase from "@database/supabase.config";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다.", resultCode: false });
  }

  const { user_hp, type } = req.body;

  if (!user_hp) {
    return res.status(200).json({ message: "휴대전화 번호를 입력해 주세요.", resultCode: false });
  }

  try {
    const { data: existingUser, error: userError } = await supabase
      .from("emps")
      .select("user_hp")
      .eq("user_hp", user_hp)
      .single();

    if (userError && userError.code !== "PGRST116") {
      throw userError;
    }

    if (type === "join" && existingUser) {
      return res.status(200).json({
        message: "이미 가입한 휴대전화 번호입니다.",
        resultCode: false,
      });
    }

    const { data: existingCertification, error: certError } = await supabase
      .from("certification")
      .select("user_hp, certification_number, create_date, seq")
      .eq("user_hp", user_hp)
      .single();

    if (certError && certError.code !== "PGRST116") {
      throw certError;
    }

    const CertificationNumber = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingCertification) {
      const { error: updateError } = await supabase
        .from("certification")
        .update({
          certification_number: CertificationNumber,
          create_date: new Date(),
        })
        .eq("user_hp", user_hp);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Generate a unique seq number
      let seq = null;
      while (true) {
        const { data: maxSeq, error: maxSeqError } = await supabase
          .from("certification")
          .select("seq")
          .order("seq", { ascending: false })
          .limit(1)
          .single();

        if (maxSeqError && maxSeqError.code !== "PGRST116") {
          throw maxSeqError;
        }

        seq = maxSeq ? maxSeq.seq + 1 : 1;

        const { data: seqCheck, error: seqCheckError } = await supabase
          .from("certification")
          .select("seq")
          .eq("seq", seq)
          .single();

        if (seqCheckError && seqCheckError.code === "PGRST116") {
          break;
        } else if (seqCheckError) {
          throw seqCheckError;
        }
      }

      const { error: insertError } = await supabase.from("certification").insert({
        seq,
        user_hp: user_hp,
        certification_number: CertificationNumber,
        create_date: new Date(),
      });

      if (insertError) {
        throw insertError;
      }
    }

    return res.status(200).json({
      message: `인증 번호는 ${CertificationNumber} 입니다.`,
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
