import { NextApiRequest, NextApiResponse } from "next";
import { AppDataSource } from "@database/typeorm.config";
import { Emps } from "@entities/Emps.entity";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("wqeqweqweqweqweqwe", req);
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(200).json({ message: "아이디를 입력해 주세요." });
  }

  try {
    const dataSource = await AppDataSource.useFactory();
    const userRepository = dataSource.getRepository(Emps);
    const existingUser = await userRepository.findOne({ where: { user_id } });

    if (existingUser) {
      return res
        .status(200)
        .json({ message: "이미 사용 중인 아이디입니다.", resultCode: false });
    } else {
      return res
        .status(200)
        .json({ message: "사용 가능한 아이디입니다.", resultCode: true });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "서버 에러가 발생하였습니다.", error: error });
  }
}
