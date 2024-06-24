"use server";
import { NextApiRequest, NextApiResponse } from "next";
import { AppDataSource } from "@database/typeorm.config";
import { Emps } from "@entities/Emps.entity";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "잘못된 메소드입니다.", resultCode: false });
  }
  const { user_name, user_hp, user_certification } = req.body;

  if (!user_name) {
    return res
      .status(200)
      .json({ message: "이름을 입력해 주세요.", resultCode: false });
  }

  if (!user_hp) {
    return res
      .status(200)
      .json({ message: "전화번호를 입력해 주세요.", resultCode: false });
  }

  if (!user_certification) {
    return res
      .status(200)
      .json({ message: "전화번호를 인증해 주세요.", resultCode: false });
  }

  try {
    const dataSource = await AppDataSource.useFactory();
    const empsRepository = dataSource.getRepository(Emps);

    const existingUser = await empsRepository.findOne({
      where: {
        user_name: user_name,
        user_hp: user_hp,
        user_certification: user_certification,
      },
    });

    if (existingUser) {
      return res
        .status(200)
        .json({
          message: `아이디는 ${existingUser.user_id} 입니다.`,
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
