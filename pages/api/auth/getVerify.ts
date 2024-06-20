"use server";
import { NextApiRequest, NextApiResponse } from "next";
import { AppDataSource } from "@database/typeorm.config";
import { Emps } from "@entities/Emps.entity";
import { Certification } from "@entities/Certification.entity";
import { DeepPartial } from "typeorm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "잘못된 메소드입니다.", resultCode: false });
  }
  const { user_hp } = req.body;

  if (!user_hp) {
    return res
      .status(200)
      .json({ message: "휴대전화 번호를 입력해 주세요.", resultCode: false });
  }

  try {
    const dataSource = await AppDataSource.useFactory();
    const empsRepository = dataSource.getRepository(Emps);
    const certificationRepository = dataSource.getRepository(Certification);
    const existingUser = await empsRepository.findOne({ where: { user_hp } });

    if (existingUser) {
      return res.status(200).json({
        message: "이미 가입한 휴대전화 번호입니다.",
        resultCode: false,
      });
    } else {
      const existingCertification = await certificationRepository.findOne({
        where: { user_hp },
      });
      const CertificationNumber = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      if (existingCertification) {
        existingCertification.certification_number = CertificationNumber;
        existingCertification.create_date = new Date();

        await certificationRepository.save(existingCertification);
      } else {
        const certification: DeepPartial<Certification> = {
          user_hp: user_hp,
          certification_number: CertificationNumber,
          create_date: new Date(),
        };

        const newCertification = certificationRepository.create(certification);
        await certificationRepository.save(newCertification);
      }

      return res.status(200).json({
        message: `인증 번호는 ${CertificationNumber} 입니다.`,
        resultCode: true,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "서버 에러가 발생하였습니다.",
      error: error,
      resultCode: false,
    });
  }
}
