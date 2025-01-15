"use server";
import { NextApiResponse, NextApiRequest } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";

export default async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  const { spaceUid, userUid } = JSON.parse(req.body);

  authenticateToken(req, res, async () => {
    if (req.user) {
      const uid = req.user.claims.UID;

      try {
        const { data: space, error: spaceError } = await supabase
          .from("space")
          .select("*")
          .eq("UID", spaceUid)
          .single();

        if (spaceError || !space) {
          return res.status(200).json({
            message: "스페이스 정보가 올바르지 않습니다.",
            resultCode: false,
          });
        }

        if (space.space_manager !== uid) {
          return res.status(200).json({
            message: "이관 권한이 없습니다.",
            resultCode: false,
          });
        }

        const { data: spacesManagedByUser, error: managerSpacesError } = await supabase
          .from("space")
          .select("*")
          .eq("space_manager", uid);

        if (managerSpacesError || !spacesManagedByUser || spacesManagedByUser.length < 2) {
          return res.status(200).json({
            message: "하나 이상의 스페이스에 매니저 권한은 필수입니다.",
            resultCode: false,
          });
        }

        const { data: user, error: userError } = await supabase.from("emps").select("*").eq("UID", userUid).single();

        if (userError || !user) {
          return res.status(200).json({
            message: "사용자 정보가 올바르지 않습니다.",
            resultCode: false,
          });
        }

        const updatedSpaceUsers = [
          ...space.space_users.filter((user: string) => user !== userUid),
          space.space_manager,
        ];

        const { error: updateError } = await supabase
          .from("space")
          .update({
            space_manager: userUid,
            space_users: updatedSpaceUsers,
          })
          .eq("UID", spaceUid);

        if (updateError) {
          return res.status(200).json({
            message: "스페이스 매니저 이관 중 오류가 발생했습니다.",
            resultCode: false,
          });
        }

        return res.status(200).json({
          message: "스페이스 매니저 이관이 완료되었습니다.",
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
}
