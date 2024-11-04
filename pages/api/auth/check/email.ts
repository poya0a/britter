"use server";
import { NextApiRequest, NextApiResponse } from "next";
import { getDataSource } from "@database/typeorm.config";
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

  const { user_email } = req.body;

  if (!user_email) {
    return res
      .status(200)
      .json({ message: "이메일을 입력해 주세요.", resultCode: false });
  }

  try {
    const dataSource = await getDataSource();
    const empsRepository = dataSource.getRepository(Emps);
    const existingUser = await empsRepository.findOne({
      where: { user_email },
    });

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
