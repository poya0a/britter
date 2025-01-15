"use server";
import { NextApiResponse, NextApiRequest } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";
import { paginate } from "@server/utils/paginate";

export default async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }
  const { spaceUid, page, searchWord } = JSON.parse(req.body);
  const pageNumber = parseInt(page, 10);

  authenticateToken(req, res, async () => {
    if (req.user) {
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

        const { data: manager, error: managerError } = await supabase
          .from("emps")
          .select(
            "UID, user_profile_seq, user_id, user_name, user_hp, user_email, user_birth, user_public, status_emoji, status_message"
          )
          .eq("UID", space.space_manager)
          .single();

        if (managerError || !manager) {
          return res.status(200).json({
            message: "매니저 정보를 찾을 수 없습니다.",
            resultCode: false,
          });
        }

        const managerWithRole = { ...manager, roll: "manager" };

        const spaceUsers = [managerWithRole, ...space.space_users];

        const filteredUsers = await Promise.all(
          spaceUsers.map(async (user) => {
            if (typeof user === "string") {
              const { data: userInfo, error: userError } = await supabase
                .from("emps")
                .select(
                  "UID, user_profile_seq, user_id, user_name, user_hp, user_email, user_birth, user_public, status_emoji, status_message"
                )
                .eq("UID", user)
                .single();

              if (userError || !userInfo) {
                return null;
              }

              if (searchWord && !userInfo.user_name.includes(searchWord)) {
                return null;
              }

              return { ...userInfo, roll: "member" };
            } else {
              if (!searchWord || user.user_name?.includes(searchWord)) {
                return user;
              }
              return null;
            }
          })
        );

        const validUsers = filteredUsers.filter((user) => user !== null);

        const { paginatedItems, pageInfo } = paginate(validUsers, pageNumber, 10);

        return res.status(200).json({
          message: "스페이스 멤버를 조회하였습니다.",
          data: paginatedItems,
          pageInfo: pageInfo,
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
