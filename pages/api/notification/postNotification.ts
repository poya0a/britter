"use server";
import { NextApiResponse } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";
import { v4 as uuidv4 } from "uuid";
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
          message: err,
          resultCode: false,
        });
      }
      if (req.user) {
        try {
          if (fields.senderUid && fields.recipientUid && fields.notifyType) {
            const notifyType: string = fields.notifyType[0];
            const senderUid: string = fields.senderUid[0];
            const recipientUid: string = fields.recipientUid[0];

            const { data: findUser, error: userError } = await supabase
              .from("emps")
              .select("*")
              .eq("UID", notifyType === "space" ? senderUid : recipientUid)
              .single();

            const { data: findSpaceList, error: spaceListError } = await supabase
              .from("spaceList")
              .select("*")
              .eq("UID", notifyType === "space" ? senderUid : recipientUid)
              .single();

            if (userError || spaceListError) {
              return res.status(200).json({
                message: "사용자 정보를 찾을 수 없습니다.",
                resultCode: false,
              });
            }

            const { data: findSpace, error: spaceError } = await supabase
              .from("space")
              .select("*")
              .eq("UID", notifyType === "space" ? recipientUid : senderUid)
              .single();

            if (spaceError) {
              return res.status(200).json({
                message: "스페이스 정보를 찾을 수 없습니다. 다시 시도해 주세요.",
                resultCode: false,
              });
            }

            if (fields.UID && fields.response) {
              const { data: existingNotification } = await supabase
                .from("notifications")
                .select("*")
                .eq("UID", fields.UID[0])
                .single();

              if (
                existingNotification &&
                senderUid === existingNotification.sender_uid &&
                recipientUid === existingNotification.recipient_uid
              ) {
                if (fields.response[0] === "false") {
                  const { error } = await supabase.from("notifications").delete().eq("UID", fields.UID[0]);

                  if (error) {
                    return res.status(200).json({
                      message: "취소 실패하였습니다.",
                      resultCode: false,
                    });
                  }

                  return res.status(200).json({
                    message: "요청 취소되었습니다.",
                    data: { type: notifyType, uid: recipientUid },
                    resultCode: true,
                  });
                } else {
                  return res.status(200).json({
                    message: "중복된 요청입니다.",
                    resultCode: false,
                  });
                }
              } else if (
                existingNotification &&
                senderUid === existingNotification.recipient_uid &&
                recipientUid === existingNotification.sender_uid
              ) {
                if (fields.response[0] === "true") {
                  try {
                    if (notifyType === "space") {
                      findSpace.space_users.push(senderUid);
                      findSpaceList.space.push(findSpace.UID);
                    } else {
                      findSpace.space_users.push(recipientUid);
                      findSpaceList.space.push(findSpace.UID);
                    }

                    const { data: updatedSpace } = await supabase.from("space").upsert(findSpace);

                    const { data: updatedSpaceList } = await supabase.from("spaceList").upsert(findSpaceList);

                    const uid = uuidv4();
                    const notify = {
                      UID: uid,
                      recipient_uid: recipientUid,
                      sender_uid: senderUid,
                      notify_type: "acceptance",
                      create_date: new Date(),
                    };

                    const { data: newNotify } = await supabase.from("notifications").insert([notify]);

                    if (updatedSpace && updatedSpaceList && newNotify) {
                      return res.status(200).json({
                        message: `${notifyType === "space" ? "스페이스" : "사용자"}를 추가하였습니다.`,
                        data: { type: notifyType, uid: recipientUid },
                        resultCode: true,
                      });
                    } else {
                      return res.status(200).json({
                        message: `${notifyType === "space" ? "스페이스" : "사용자"} 추가에 실패하였습니다.`,
                        resultCode: false,
                      });
                    }
                  } catch (error) {
                    return res.status(200).json({
                      message: `${notifyType === "space" ? "스페이스" : "사용자"} 추가 중 오류가 발생하였습니다.`,
                      resultCode: false,
                    });
                  }
                } else if (fields.response[0] === "false") {
                  try {
                    const uid = uuidv4();
                    const notify = {
                      UID: uid,
                      recipient_uid: recipientUid,
                      sender_uid: senderUid,
                      notify_type: "refusal",
                      create_date: new Date(),
                    };

                    await supabase.from("notifications").insert([notify]);

                    return res.status(200).json({
                      message: "거절 완료되었습니다.",
                      data: { type: notifyType, uid: recipientUid },
                      resultCode: true,
                    });
                  } catch (error) {
                    return res.status(200).json({
                      message: "거절 실패하였습니다.",
                      resultCode: false,
                    });
                  }
                }
              }
            } else {
              if (notifyType === "space") {
                if (findUser.user_level === 1 && findSpaceList.space.length >= 3) {
                  return res.status(200).json({
                    message: "참여할 수 있는 스페이스는 최대 3개입니다.",
                    resultCode: false,
                  });
                }

                if (findSpace.space_public) {
                  const existingUser = findSpace.space_users.includes(senderUid);

                  if (existingUser) {
                    return res.status(200).json({
                      message: "중복된 요청입니다.",
                      resultCode: false,
                    });
                  } else {
                    findSpace.space_users.push(senderUid);
                    findSpaceList.space.push(recipientUid);

                    const uid = uuidv4();
                    const notify = {
                      UID: uid,
                      recipient_uid: recipientUid,
                      sender_uid: senderUid,
                      notify_type: "memberIn",
                      create_date: new Date(),
                    };

                    const { data: newNotify } = await supabase.from("notifications").insert([notify]);

                    const { data: updatedSpace } = await supabase.from("space").upsert(findSpace);

                    const { data: updatedSpaceList } = await supabase.from("spaceList").upsert(findSpaceList);

                    if (updatedSpace && updatedSpaceList && newNotify) {
                      return res.status(200).json({
                        message: "스페이스를 추가하였습니다.",
                        data: { type: notifyType, uid: recipientUid },
                        resultCode: true,
                      });
                    } else {
                      return res.status(200).json({
                        message: "스페이스를 추가에 실패하였습니다.",
                        resultCode: false,
                      });
                    }
                  }
                } else {
                  const { data: existingNotify } = await supabase
                    .from("notifications")
                    .select("*")
                    .eq("recipient_uid", recipientUid)
                    .eq("sender_uid", senderUid)
                    .eq("notify_type", notifyType)
                    .single();

                  if (existingNotify) {
                    return res.status(200).json({
                      message: "중복된 요청입니다.",
                      resultCode: false,
                    });
                  } else {
                    const uid = uuidv4();
                    const notify = {
                      UID: uid,
                      recipient_uid: recipientUid,
                      sender_uid: senderUid,
                      notify_type: notifyType,
                      create_date: new Date(),
                    };

                    const { data: newNotify } = await supabase.from("notifications").insert([notify]);

                    if (newNotify) {
                      return res.status(200).json({
                        message: "스페이스를 추가 요청 완료하였습니다.",
                        data: { type: notifyType, uid: recipientUid },
                        resultCode: true,
                      });
                    } else {
                      return res.status(200).json({
                        message: "요청 실패하였습니다.",
                        resultCode: false,
                      });
                    }
                  }
                }
              } else if (notifyType === "user") {
                const { data: existingNotify } = await supabase
                  .from("notifications")
                  .select("*")
                  .eq("recipient_uid", recipientUid)
                  .eq("sender_uid", senderUid)
                  .eq("notify_type", notifyType)
                  .single();

                if (existingNotify) {
                  return res.status(200).json({
                    message: "중복된 요청입니다.",
                    resultCode: false,
                  });
                } else {
                  const uid = uuidv4();
                  const notify = {
                    UID: uid,
                    recipient_uid: recipientUid,
                    sender_uid: senderUid,
                    notify_type: notifyType,
                    create_date: new Date(),
                  };

                  const { data: newNotify } = await supabase.from("notifications").insert([notify]);

                  if (newNotify) {
                    return res.status(200).json({
                      message: "초대 요청 완료하였습니다.",
                      data: { type: notifyType, uid: recipientUid },
                      resultCode: true,
                    });
                  } else {
                    return res.status(200).json({
                      message: "초대 요청 실패하였습니다.",
                      resultCode: false,
                    });
                  }
                }
              }
            }
          } else {
            return res.status(200).json({
              message: "요청 값이 올바르지 않습니다.",
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
