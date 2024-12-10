"use server";
import { NextApiResponse } from "next";
import { getDataSource } from "@database/typeorm.config";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@server/utils/authenticateToken";
import formidable from "formidable";
import bcrypt from "bcrypt";
import { Emps } from "@entities/Emps.entity";
import { passwordPattern, regexValue } from "@/utils/regex";
import { Certification } from "@/server/entities/Certification.entity";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  authenticateToken(req, res, async () => {
    const form = formidable({});

    form.parse(req, async (err, fields) => {
      if (err) {
        return res.status(500).json({
          message: err,
          resultCode: false,
        });
      }
      if (req.user) {
        // 토큰 이용하여 UID GET
        const uid = req.user.claims.UID;

        if (!fields.userHp) {
          return res
            .status(200)
            .json({ message: "전화번호를 입력해 주세요.", resultCode: false });
        }

        if (!fields.userCertification) {
          return res
            .status(200)
            .json({ message: "전화번호를 인증해 주세요.", resultCode: false });
        }

        const userHp: string = JSON.parse(fields.userHp[0]);
        const userCertification: number = parseInt(fields.userCertification[0]);

        try {
          const dataSource = await getDataSource();

          const empsRepository = dataSource.getRepository(Emps);

          if (!uid) {
            return res.status(200).json({
              message: "사용자 정보를 찾을 수 없습니다.",
              resultCode: false,
            });
          }

          const findUser = await empsRepository.findOne({
            where: { UID: uid },
          });

          if (findUser) {
            if (userHp === findUser.user_hp) {
              return res.status(200).json({
                message: "기존 비밀번호와 동일한 비밀번호입니다.",
                resultCode: false,
              });
            }

            const existinghp = await empsRepository.findOne({
              where: { user_hp: userHp },
            });

            if (existinghp) {
              return res.status(200).json({
                message: "이미 사용 중인 전화번호입니다.",
                resultCode: false,
              });
            }
            // 기존 인증 데이터 삭제
            const certificationRepository =
              dataSource.getRepository(Certification);
            const findCertification = await certificationRepository.findOne({
              where: {
                seq: findUser.user_certification,
                user_hp: findUser.user_hp,
              },
            });

            // 사용자 전화번호 및 인증번호 업데이트
            findUser.user_hp = userHp;
            findUser.user_certification = userCertification;

            const updateUser = await empsRepository.save(findUser);

            if (updateUser) {
              if (!findCertification) {
                return res.status(200).json({
                  message: "전화번호 인증 정보를 찾을 수 없습니다.",
                  resultCode: false,
                });
              }

              const deleteCertification = await certificationRepository.delete(
                findCertification
              );

              if (deleteCertification) {
                return res.status(200).json({
                  message: "전화번호가 변경되었습니다.",
                  resultCode: true,
                });
              } else {
                // 기존 인증 데이터 삭제 실패 시 원복
                findUser.user_hp = findCertification.user_hp;
                findUser.user_certification = findCertification.seq;

                await empsRepository.save(findUser);
                return res.status(200).json({
                  message: "전화번호가 변경에 실패하였습니니다.",
                  resultCode: false,
                });
              }
            } else {
              return res.status(200).json({
                message: "전화번호가 변경에 실패하였습니니다.",
                resultCode: false,
              });
            }
          } else {
            return res.status(200).json({
              message: "사용자 정보를 찾을 수 없습니다.",
              resultCode: false,
            });
          }
        } catch (error) {
          return res.status(500).json({
            message:
              typeof error === "string" ? error : "서버 에러가 발생하였습니다.",
            error: error,
            resultCode: false,
          });
        }
      } else {
        return res.status(200).json({
          message: "사용자 정보를 찾을 수 없습니다.",
          resultCode: false,
        });
      }
    });
  });
}
