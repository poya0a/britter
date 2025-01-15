"use server";
import { NextApiResponse } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";
import formidable from "formidable";
import bcrypt from "bcrypt";
import { passwordPattern, regexValue } from "@utils/regex";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  authenticateToken(req, res, async () => {
    const form = formidable({});

    form.parse(req, async (err, fields) => {
      if (err) {
        return res.status(200).json({
          message: err,
          resultCode: false,
        });
      }
      if (req.user) {
        // 토큰 이용하여 UID GET
        const uid = req.user.claims.UID;

        if (!fields.userOriginalPw || !fields.userPw) {
          return res.status(200).json({ message: "비밀번호를 입력해 주세요.", resultCode: false });
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
          if (!uid) {
            return res.status(200).json({
              message: "사용자 정보를 찾을 수 없습니다.",
              resultCode: false,
            });
          }

          const { data: findUser, error: userError } = await supabase.from("emps").select("*").eq("UID", uid).single();

          if (userError) {
            return res.status(200).json({
              message: "사용자 정보를 찾을 수 없습니다.",
              resultCode: false,
            });
          }
          const isMatch = await bcrypt.compare(JSON.parse(userOriginalPw), findUser.user_pw);

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

          const { error: updateError } = await supabase.from("emps").update({ user_pw: hashedPassword }).eq("UID", uid);

          if (updateError) {
            return res.status(200).json({
              message: "비밀번호 변경에 실패하였습니다.",
              resultCode: false,
            });
          }

          return res.status(200).json({
            message: "비밀번호가 변경되었습니다.",
            resultCode: true,
          });
        } catch (error) {
          return res.status(200).json({
            message: "서버 에러가 발생하였습니다.",
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
