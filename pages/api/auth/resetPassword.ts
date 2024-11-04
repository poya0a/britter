"use server";
import { NextApiRequest, NextApiResponse } from "next";
import { getDataSource } from "@database/typeorm.config";
import { Emps } from "@entities/Emps.entity";
import bcrypt from "bcrypt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "잘못된 메소드입니다.", resultCode: false });
  }
  const {
    user_pw,
    user_pw_check,
    user_id,
    user_name,
    user_hp,
    user_certification,
  } = req.body;

  if (!user_id || !user_name || !user_hp || !user_certification) {
    return res.status(200).json({
      message: "회원 정보가 없습니다. 비밀번호 찾기를 진행해 주세요.",
      resultCode: false,
    });
  }

  if (!user_pw) {
    return res
      .status(200)
      .json({ message: "비밀번호를 입력해 주세요.", resultCode: false });
  }

  if (!user_pw_check) {
    return res.status(200).json({
      message: "비밀번호를 한 번 더 입력해 주세요.",
      resultCode: false,
    });
  }

  if (user_pw !== user_pw_check) {
    return res
      .status(200)
      .json({ message: "비밀번호가 일치하지 않습니다.", resultCode: false });
  }

  if (!user_certification) {
    return res
      .status(200)
      .json({ message: "전화번호 인증을 진행해 주세요.", resultCode: false });
  }

  try {
    const dataSource = await getDataSource();
    const empsRepository = dataSource.getRepository(Emps);

    const existingUser = await empsRepository.findOne({
      where: {
        user_id: user_id,
        user_name: user_name,
        user_hp: user_hp,
        user_certification: user_certification,
      },
    });

    const hashedPassword = await bcrypt.hash(user_pw, 10);

    if (existingUser) {
      existingUser.user_pw = hashedPassword;

      await empsRepository.save(existingUser);

      return res.status(200).json({
        message: "비밀번호를 재설정이 완료되었습니다.",
        resultCode: true,
      });
    } else {
      return res
        .status(200)
        .json({ message: "회원 정보가 없습니다.", resultCode: false });
    }
  } catch (error) {
    return res.status(500).json({
      message: "서버 에러가 발생하였습니다.",
      error: error,
      resultCode: false,
    });
  }
}
