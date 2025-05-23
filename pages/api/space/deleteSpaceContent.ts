"use server";
import { NextApiResponse, NextApiRequest } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";
import { extractImgDataSeq } from "@server/utils/extractImgDataSeq";
import { handleFileDelete } from "@server/utils/fileDelete";

export default async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }
  const { spaceUid } = JSON.parse(req.body);

  authenticateToken(req, res, async () => {
    if (req.user) {
      const uid = req.user.claims.UID;

      try {
        if (!spaceUid) {
          return res.status(200).json({
            message: "스페이스 정보를 찾을 수 없습니다. 다시 시도해 주세요.",
            resultCode: false,
          });
        }

        const { data: space, error: spaceError } = await supabase
          .from("space")
          .select("*")
          .eq("UID", spaceUid)
          .single();

        if (spaceError) {
          return res.status(200).json({
            message: "스페이스 정보를 찾을 수 없습니다. 다시 시도해 주세요.",
            resultCode: false,
          });
        }

        if (space.space_manager !== uid && !space.space_users.includes(uid)) {
          return res.status(200).json({
            message: "콘텐츠 삭제 권한이 없습니다.",
            resultCode: false,
          });
        }

        if (space.space_content) {
          const extractedSeqList = extractImgDataSeq(space.space_content);

          if (extractedSeqList.length > 0) {
            for (const seq of extractedSeqList) {
              await handleFileDelete(seq);
            }
          }
        }

        const { error: updateError } = await supabase.from("space").update({ space_content: null }).eq("UID", spaceUid);

        if (updateError) {
          return res.status(200).json({
            message: "콘텐츠 삭제 중 오류가 발생했습니다.",
            resultCode: false,
          });
        }

        return res.status(200).json({
          message: "콘텐츠가 삭제되었습니다.",
          data: { uid: space.UID },
          resultCode: true,
        });
      } catch (error) {
        return res.status(500).json({
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
}
