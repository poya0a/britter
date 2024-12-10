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

        if (!fields.userOriginalPw || !fields.userPw) {
          return res
            .status(200)
            .json({ message: "비밀번호를 입력해 주세요.", resultCode: false });
        }

        const userOriginalPw: string = fields.userOriginalPw[0];
        const userPw: string = fields.userPw[0];

        const validation = regexValue(passwordPattern, userPw);

        if (!validation) {
          return res.status(200).json({
            message: "영문, 숫자를 포함 8자리 이상 50자 이하로 입력해 주세요.",
            resultCode: false,
          });
        }

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
            const isMatch = await bcrypt.compare(
              JSON.parse(userOriginalPw),
              findUser.user_pw
            );

            if (!isMatch) {
              return res.status(200).json({
                message: "기존 비밀번호가 일치하지 않습니다.",
                resultCode: false,
              });
            }

            const hashedPassword = await bcrypt.hash(JSON.parse(userPw), 10);

            if (hashedPassword === findUser.user_pw) {
              return res.status(200).json({
                message: "기존 비밀번호와 동일한 비밀번호입니다.",
                resultCode: false,
              });
            }

            findUser.user_pw = hashedPassword;

            const updateUser = await empsRepository.save(findUser);

            if (updateUser) {
              return res.status(200).json({
                message: "비밀번호가 변경되었습니다.",
                resultCode: true,
              });
            } else {
              return res.status(200).json({
                message: "비밀번호가 변경에 실패하였습니니다.",
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
