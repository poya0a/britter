"use server";
import { NextApiResponse } from "next";
import { AppDataSource } from "@database/typeorm.config";
import { Space } from "@entities/Space.entity";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@/server/utils/authenticateToken";
import { DeepPartial } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { Notifications } from "@/server/entities/Notifications.entity";
import formidable from "formidable";

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
        const userUid = req.user.claims.UID;

        try {
          const dataSource = await AppDataSource.useFactory();
          const notificationsRepository =
            dataSource.getRepository(Notifications);
          const spaceRepository = dataSource.getRepository(Space);

          var notifyUid: string;
          var notifyResponse: boolean;
          var senderUid: string;
          var recipientUid: string;
          var notifyType: string;

          if (fields.senderUid && fields.recipientUid && fields.notifyType) {
            notifyType = fields.notifyType[0];

            let findSpace = await spaceRepository.findOne({
              where:
                notifyType === "space"
                  ? { UID: fields.recipientUid[0] }
                  : { UID: fields.senderUid[0] },
            });

            if (!findSpace) {
              return res.status(200).json({
                message: "요청 대상을 찾을 수 없습니다.",
                resultCode: true,
              });
            }

            if (notifyType === "space") {
              senderUid = fields.senderUid[0];
              recipientUid = findSpace.space_manager;
            } else if (notifyType === "user") {
              senderUid = findSpace.space_manager;
              recipientUid = fields.recipientUid[0];
            } else {
              return res.status(200).json({
                message: "요청 타입이 올바르지 않습니다.",
                resultCode: false,
              });
            }

            if (fields.UID && fields.response) {
              const existingNotification =
                await notificationsRepository.findOne({
                  where: { UID: fields.UID[0] },
                });

              if (existingNotification) {
                if (fields.response[0] === "true") {
                } else {
                }
                // existingNotification.title = title;
                // existingNotification.content = content;
                // existingNotification.modify_date = new Date();
                console.log(existingNotification);
                // const updatedNotification = await notificationsRepository.save(existingNotification);
              } else {
                return res.status(200).json({
                  message: "요청 내역을 찾을 수 없습니다.",
                  resultCode: false,
                });
              }
            } else {
              const uid = uuidv4();

              const notify: DeepPartial<Notifications> = {
                UID: uid,
                recipient_uid: recipientUid,
                sender_uid: senderUid,
                notify_type: notifyType,
                confirm: false,
              };

              const newNotify = notificationsRepository.create(notify);
              const saveNotify = await notificationsRepository.save(newNotify);

              if (saveNotify) {
                const notifyUserUid: string =
                  notifyType === "space" ? userUid : recipientUid;
                let userList: string[] = [];
                if (notifyType === "space") {
                  findSpace = await spaceRepository.findOne({
                    where: { UID: fields.recipientUid[0] },
                  });
                } else if (notifyType === "user") {
                  findSpace = await spaceRepository.findOne({
                    where: { UID: fields.senderUid[0] },
                  });
                } else {
                  return res.status(200).json({
                    message: "요청 타입이 올바르지 않습니다.",
                    resultCode: false,
                  });
                }

                if (!findSpace) {
                  return res.status(200).json({
                    message: "요청 대상을 찾을 수 없습니다.",
                    resultCode: true,
                  });
                }

                userList =
                  notifyType === "space"
                    ? findSpace.request_users
                    : findSpace.invite_users;

                const existingUser = userList.includes(notifyUserUid);

                if (existingUser) {
                  return res.status(200).json({
                    message: "중복된 요청입니다.",
                    resultCode: false,
                  });
                } else {
                  userList.push(notifyUserUid);

                  if (notifyType === "space") {
                    findSpace.request_users = userList;
                  } else if (notifyType === "user") {
                    findSpace.invite_users = userList;
                  }

                  const updateSpace = await spaceRepository.save(findSpace);
                  if (updateSpace) {
                    return res.status(200).json({
                      message: "요청 완료하였습니다.",
                      resultCode: true,
                    });
                  }
                }
                if (!findSpace) {
                  return res.status(200).json({
                    message: "요청 대상을 찾을 수 없습니다.",
                    resultCode: true,
                  });
                } else {
                  return res.status(200).json({
                    message: "요청 대상을 찾을 수 없습니다.",
                    resultCode: true,
                  });
                }
              } else {
                return res.status(200).json({
                  message: "요청 실패하였습니다.",
                  resultCode: false,
                });
              }
            }
          } else {
            return res.status(200).json({
              message: "요청 값이 올바르지 않습니다.",
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
