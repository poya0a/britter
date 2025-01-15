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
    return res.status(405).json({ message: "잘못된 메소드입니다.", resultCode: false });
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
        try {
          const uid = req.user.claims.UID;

          if (!fields.space) {
            return res.status(200).json({
              message: "스페이스 정보를 찾을 수 없습니다. 다시 시도해 주세요.",
              resultCode: false,
            });
          }

          if (!fields.content) {
            return res.status(200).json({
              message: "콘텐츠 내용을 입력해 주세요.",
              resultCode: false,
            });
          }

          const spaceUid: string = fields.space[0];
          const spaceContent: string = fields.content[0];

          const { data: space, error: spaceError } = await supabase
            .from("space")
            .select("*")
            .eq("UID", spaceUid)
            .single();

          if (spaceError || !space) {
            return res.status(200).json({
              message: "스페이스 정보를 찾을 수 없습니다. 다시 시도해 주세요.",
              resultCode: false,
            });
          }

          if (space.space_manager === uid || space.space_users.includes(uid)) {
            const { error: updateError } = await supabase
              .from("space")
              .update({ space_content: spaceContent })
              .eq("UID", spaceUid);

            if (updateError) {
              return res.status(200).json({
                message: "콘텐츠 업데이트 중 오류가 발생했습니다.",
                resultCode: false,
              });
            }

            return res.status(200).json({
              message: "콘텐츠가 저장되었습니다.",
              data: { uid: space.UID },
              resultCode: true,
            });
          } else {
            return res.status(200).json({
              message: "콘텐츠 작성 권한이 없습니다.",
              resultCode: false,
            });
          }
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
