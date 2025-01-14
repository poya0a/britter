"use server";
import { NextApiResponse } from "next";
import supabase from "@database/supabase.config";
import { authenticateToken } from "@server/utils/authenticateToken";
import { v4 as uuidv4 } from "uuid";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: NextApiResponse) {
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
        const userUid = req.user.claims.UID;

        try {
          const { data: findUser, error: userError } = await supabase
            .from("Emps")
            .select("*")
            .eq("UID", userUid)
            .single();

          if (userError || !findUser) {
            return res.status(200).json({
              message: "사용자 정보를 찾을 수 없습니다.",
              resultCode: false,
            });
          }

          if (fields.exitType && fields.senderUid && fields.exitUid) {
            const exitType: string = fields.exitType[0];
            const senderUid: string = fields.senderUid[0];
            const exitUid: string = fields.exitUid[0];

            const { data: findSpace, error: spaceError } = await supabase
              .from("Space")
              .select("*")
              .eq("UID", exitType === "space" ? exitUid : senderUid)
              .single();

            const { data: findSpaceList, error: spaceListError } = await supabase
              .from("SpaceList")
              .select("*")
              .eq("UID", exitType === "space" ? senderUid : exitUid)
              .single();

            if (spaceError || spaceListError || !findSpace || !findSpaceList) {
              return res.status(200).json({
                message: "스페이스 정보를 찾을 수 없습니다. 다시 시도해 주세요.",
                resultCode: false,
              });
            }

            if (exitType === "space" && senderUid === userUid) {
              if (findSpace.space_manager === senderUid) {
                return res.status(200).json({
                  message: "탈퇴 전 매니저 권한을 변경하세요.",
                  resultCode: false,
                });
              }

              const findExitSpaceInUser = findSpace.space_users.find((user: string) => user === senderUid);
              const findExitSpaceListInUser = findSpaceList.space.find((user: string) => user === exitUid);

              if (!findExitSpaceInUser || !findExitSpaceListInUser) {
                return res.status(200).json({
                  message: "요청 값이 올바르지 않습니다.",
                  resultCode: false,
                });
              }

              findSpace.space_users = findSpace.space_users.filter((user: string) => user !== senderUid);

              findSpaceList.space = findSpaceList.space.filter((user: string) => user !== exitUid);

              const uid = uuidv4();
              const { error: notifyError } = await supabase.from("Notifications").insert([
                {
                  UID: uid,
                  recipient_uid: exitUid,
                  sender_uid: senderUid,
                  notify_type: "memberOut",
                  create_date: new Date(),
                },
              ]);

              if (notifyError) {
                return res.status(200).json({
                  message: "알림 저장 중 오류가 발생했습니다.",
                  resultCode: false,
                });
              }

              const { error: spaceUpdateError } = await supabase.from("Space").upsert([findSpace]);

              const { error: spaceListUpdateError } = await supabase.from("SpaceList").upsert([findSpaceList]);

              if (spaceUpdateError || spaceListUpdateError) {
                return res.status(200).json({
                  message: "스페이스 업데이트 중 오류가 발생했습니다.",
                  resultCode: false,
                });
              }

              return res.status(200).json({
                message: "탈퇴되었습니다.",
                data: { type: exitType, uid: exitUid },
                resultCode: true,
              });
            } else if (exitType === "user") {
              if (findSpace.space_manager !== userUid) {
                return res.status(200).json({
                  message: "매니저 권한이 없습니다.",
                  resultCode: false,
                });
              }

              const findExitSpaceInUser = findSpace.space_users.find((user: string) => user === exitUid);
              const findExitSpaceListInUser = findSpaceList.space.find((user: string) => user === senderUid);

              if (!findExitSpaceInUser || !findExitSpaceListInUser) {
                return res.status(200).json({
                  message: "요청 값이 올바르지 않습니다.",
                  resultCode: false,
                });
              }

              findSpace.space_users = findSpace.space_users.filter((user: string) => user !== exitUid);

              findSpaceList.space = findSpaceList.space.filter((user: string) => user !== senderUid);

              const uid = uuidv4();
              const { error: notifyError } = await supabase.from("Notifications").insert([
                {
                  UID: uid,
                  recipient_uid: exitUid,
                  sender_uid: senderUid,
                  notify_type: "memberOut",
                  create_date: new Date(),
                },
              ]);

              if (notifyError) {
                return res.status(200).json({
                  message: "알림 저장 중 오류가 발생했습니다.",
                  resultCode: false,
                });
              }

              const { error: spaceUpdateError } = await supabase.from("Space").upsert([findSpace]);

              const { error: spaceListUpdateError } = await supabase.from("SpaceList").upsert([findSpaceList]);

              if (spaceUpdateError || spaceListUpdateError) {
                return res.status(200).json({
                  message: "스페이스 업데이트 중 오류가 발생했습니다.",
                  resultCode: false,
                });
              }

              return res.status(200).json({
                message: "탈퇴되었습니다.",
                data: { type: exitType, uid: exitUid },
                resultCode: true,
              });
            } else {
              return res.status(200).json({
                message: "요청 값이 올바르지 않습니다.",
                resultCode: false,
              });
            }
          } else {
            return res.status(200).json({
              message: "요청 값이 올바르지 않습니다.",
              resultCode: false,
            });
          }
        } catch (error) {
          return res.status(200).json({
            message: typeof error === "string" ? error : "서버 에러가 발생하였습니다.",
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
