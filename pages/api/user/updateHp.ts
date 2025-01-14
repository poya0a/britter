"use server";
import { NextApiResponse } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";
import formidable from "formidable";

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
          message: "폼 데이터를 처리하는 중 오류가 발생했습니다.",
          resultCode: false,
        });
      }

      if (!req.user) {
        return res.status(401).json({
          message: "사용자 인증 정보가 없습니다.",
          resultCode: false,
        });
      }

      const uid = req.user.claims.UID;

      if (!fields.userHp) {
        return res.status(400).json({ message: "전화번호를 입력해 주세요.", resultCode: false });
      }

      if (!fields.userCertification) {
        return res.status(400).json({ message: "전화번호를 인증해 주세요.", resultCode: false });
      }

      const userHp = JSON.parse(fields.userHp[0]);
      const userCertification = parseInt(fields.userCertification[0]);

      try {
        const { data: findUser, error: userError } = await supabase.from("emps").select("*").eq("UID", uid).single();

        if (userError || !findUser) {
          return res.status(404).json({
            message: "사용자 정보를 찾을 수 없습니다.",
            resultCode: false,
          });
        }

        if (userHp === findUser.user_hp) {
          return res.status(400).json({
            message: "기존 비밀번호와 동일한 전화번호입니다.",
            resultCode: false,
          });
        }

        const { data: existingHp, error: hpError } = await supabase
          .from("emps")
          .select("user_hp")
          .eq("user_hp", userHp)
          .single();

        if (hpError && hpError.code !== "PGRST116") {
          return res.status(200).json({
            message: "전화번호 중복 검사 중 오류가 발생했습니다.",
            resultCode: false,
          });
        }

        if (existingHp) {
          return res.status(400).json({
            message: "이미 사용 중인 전화번호입니다.",
            resultCode: false,
          });
        }

        const { data: findCertification, error: certError } = await supabase
          .from("certification")
          .select("*")
          .eq("seq", findUser.user_certification)
          .eq("user_hp", findUser.user_hp)
          .single();

        if (certError && certError.code !== "PGRST116") {
          return res.status(200).json({
            message: "인증 정보 조회 중 오류가 발생했습니다.",
            resultCode: false,
          });
        }

        const { error: updateError } = await supabase
          .from("emps")
          .update({
            user_hp: userHp,
            user_certification: userCertification,
          })
          .eq("UID", uid);

        if (updateError) {
          return res.status(200).json({
            message: "전화번호 업데이트 중 오류가 발생했습니다.",
            resultCode: false,
          });
        }

        if (findCertification) {
          const { error: deleteCertError } = await supabase
            .from("certification")
            .delete()
            .eq("seq", findCertification.seq);

          if (deleteCertError) {
            await supabase
              .from("emps")
              .update({
                user_hp: findCertification.user_hp,
                user_certification: findCertification.seq,
              })
              .eq("UID", uid);

            return res.status(200).json({
              message: "기존 인증 데이터 삭제에 실패했습니다.",
              resultCode: false,
            });
          }
        }

        return res.status(200).json({
          message: "전화번호가 성공적으로 변경되었습니다.",
          resultCode: true,
        });
      } catch (error) {
        return res.status(200).json({
          message: "서버 에러가 발생했습니다.",
          error,
          resultCode: false,
        });
      }
    });
  });
}
