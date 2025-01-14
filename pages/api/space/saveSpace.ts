"use server";
import { NextApiResponse, NextApiRequest } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }
  const { spaceName } = JSON.parse(req.body);

  authenticateToken(req, res, async () => {
    if (req.user) {
      // 토큰 이용하여 UID GET
      const userUid = req.user.claims.UID;

      try {
        const uid = uuidv4();

        const { error: spaceError } = await supabase
          .from("spaces")
          .insert([
            {
              UID: uid,
              space_name: spaceName,
              space_manager: userUid,
              space_public: true,
              space_users: [],
              create_date: new Date(),
            },
          ])
          .single();

        if (spaceError) {
          return res.status(200).json({
            message: "스페이스 생성에 실패하였습니다.",
            resultCode: false,
            error: spaceError.message,
          });
        }

        const { data: spaceList, error: spaceListError } = await supabase
          .from("space_list")
          .select("*")
          .eq("UID", userUid)
          .single();

        if (spaceListError) {
          return res.status(200).json({
            message: "사용자의 스페이스 리스트를 찾을 수 없습니다.",
            resultCode: false,
            error: spaceListError.message,
          });
        }

        const { data: userData, error: userError } = await supabase
          .from("emps")
          .select("*")
          .eq("UID", userUid)
          .single();

        if (userError) {
          return res.status(200).json({
            message: "사용자 정보를 찾을 수 없습니다.",
            resultCode: false,
            error: userError.message,
          });
        }

        if (userData.user_level === 1 && spaceList.space.length >= 3) {
          return res.status(400).json({
            message: "참여할 수 있는 스페이스는 최대 3개입니다.",
            resultCode: false,
          });
        }

        const updatedSpaceList = [...spaceList.space, uid];
        const { error: updateError } = await supabase
          .from("space_list")
          .update({ space: updatedSpaceList })
          .eq("UID", userUid);

        if (updateError) {
          await supabase.from("spaces").delete().eq("UID", uid);
          return res.status(200).json({
            message: "스페이스 리스트 업데이트에 실패하였습니다.",
            resultCode: false,
            error: updateError.message,
          });
        }

        return res.status(200).json({
          message: "스페이스가 생성되었습니다.",
          data: { spaceUid: uid },
          resultCode: true,
        });
      } catch (error) {
        return res.status(200).json({
          message: "서버 에러가 발생하였습니다.",
          resultCode: false,
          error: error,
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
