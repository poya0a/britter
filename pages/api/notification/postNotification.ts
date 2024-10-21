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
import { Emps } from "@/server/entities/Emps.entity";
import { SpaceList } from "@/server/entities/SpaceList.entity";

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
          const spaceListRepository = dataSource.getRepository(SpaceList);
          const empsRepository = dataSource.getRepository(Emps);

          if (fields.senderUid && fields.recipientUid && fields.notifyType) {
            const notifyType: string = fields.notifyType[0];
            const senderUid: string = fields.senderUid[0];
            const recipientUid: string = fields.recipientUid[0];

            const findUser = await empsRepository.findOne({
              where: { UID: notifyType === "space" ? senderUid : recipientUid },
            });
            const findSpaceList = await spaceListRepository.findOne({
              where: { UID: notifyType === "space" ? senderUid : recipientUid },
            });

            if (!findUser || !findSpaceList) {
              return res.status(200).json({
                message: "사용자 정보를 찾을 수 없습니다.",
                resultCode: false,
              });
            }

            let findSpace = await spaceRepository.findOne({
              where: {
                UID: notifyType === "space" ? recipientUid : senderUid,
              },
            });

            if (!findSpace) {
              return res.status(200).json({
                message: "스페이스 정보를 찾을 수 없습니다.",
                resultCode: false,
              });
            }

            // 요청 응답
            if (fields.UID && fields.response) {
              const existingNotification =
                await notificationsRepository.findOne({
                  where: { UID: fields.UID[0] },
                });

              if (
                existingNotification &&
                senderUid === existingNotification.sender_uid &&
                recipientUid === existingNotification.recipient_uid
              ) {
                // 요청 취소
                if (fields.response[0] === "false") {
                  if (notifyType === "space") {
                    findSpace.request_users = findSpace.request_users.filter(
                      (uid) => uid !== senderUid
                    );
                  } else {
                    findSpace.invite_users = findSpace.invite_users.filter(
                      (uid) => uid !== recipientUid
                    );
                  }
                  const updatedSpace = await spaceRepository.save(findSpace);
                  const deleteNotification =
                    await notificationsRepository.delete(existingNotification);

                  if (deleteNotification && updatedSpace) {
                    return res.status(200).json({
                      message: "요청 취소되었습니다.",
                      resultCode: true,
                    });
                  } else {
                    return res.status(200).json({
                      message: "취소 실패하였습니다.",
                      resultCode: false,
                    });
                  }
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
                  // 요청 수락
                  try {
                    if (notifyType === "space") {
                      findSpace.invite_users = findSpace.invite_users.filter(
                        (uid) => uid !== senderUid
                      );
                      findSpace.space_users.push(senderUid);
                      findSpaceList.space.push(findSpace.UID);
                    } else {
                      findSpace.request_users = findSpace.request_users.filter(
                        (uid) => uid !== recipientUid
                      );
                      findSpace.space_users.push(recipientUid);
                      findSpaceList.space.push(findSpace.UID);
                    }
                    const updateSpace = await spaceRepository.save(findSpace);
                    try {
                      const updateSpaceList = await spaceListRepository.save(
                        findSpaceList
                      );

                      if (updateSpace && updateSpaceList) {
                        return res.status(200).json({
                          message: `${
                            notifyType === "space" ? "스페이스" : "사용자"
                          }를 추가하였습니다.`,
                          resultCode: true,
                        });
                      } else {
                        return res.status(200).json({
                          message: `${
                            notifyType === "space" ? "스페이스" : "사용자"
                          }스페이스 추가에 실패하였습니다.`,
                          resultCode: false,
                        });
                      }
                    } catch (error) {
                      await spaceRepository.delete(findSpace.UID);

                      return res.status(200).json({
                        message: `${
                          notifyType === "space" ? "스페이스" : "사용자"
                        } 추가에 실패하였습니다.`,
                        resultCode: false,
                      });
                    } finally {
                      await notificationsRepository.delete(
                        existingNotification
                      );
                    }
                  } catch (error) {
                    return res.status(500).json({
                      message: `${
                        notifyType === "space" ? "스페이스" : "사용자"
                      } 추가 중 오류가 발생하였습니다.`,
                      resultCode: false,
                    });
                  }
                } else if (fields.response[0] === "false") {
                  // 요청 거절
                  try {
                    findSpace.invite_users = findSpace.invite_users.filter(
                      (uid) =>
                        uid !==
                        (notifyType === "space" ? senderUid : recipientUid)
                    );

                    const updateSpace = await spaceRepository.save(findSpace);

                    if (updateSpace) {
                      return res.status(200).json({
                        message: "거절 완료되었습니다.",
                        resultCode: true,
                      });
                    } else {
                      return res.status(200).json({
                        message: "거절 실패하였습니다.",
                        resultCode: false,
                      });
                    }
                  } catch (error) {
                    return res.status(200).json({
                      message: "거절 실패하였습니다.",
                      resultCode: false,
                    });
                  } finally {
                    await notificationsRepository.delete(existingNotification);
                  }
                }
              }
            } else {
              // 요청
              if (notifyType === "space") {
                if (
                  findUser.user_level === 1 &&
                  findSpaceList.space.length >= 3
                ) {
                  return res.status(200).json({
                    message: "참여할 수 있는 스페이스는 최대 3개입니다.",
                    resultCode: false,
                  });
                }

                if (findSpace.space_public) {
                  const existingUser =
                    findSpace.space_users.includes(senderUid);

                  if (existingUser) {
                    return res.status(200).json({
                      message: "중복된 요청입니다.",
                      resultCode: false,
                    });
                  } else {
                    findSpace.space_users.push(senderUid);
                    findSpaceList.space.push(recipientUid);

                    const updateSpace = await spaceRepository.save(findSpace);
                    const updateSpaceList = await spaceListRepository.save(
                      findSpaceList
                    );

                    if (updateSpace && updateSpaceList) {
                      return res.status(200).json({
                        message: "스페이스를 추가하였습니다.",
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
                  const uid = uuidv4();

                  const notify: DeepPartial<Notifications> = {
                    UID: uid,
                    recipient_uid: recipientUid,
                    sender_uid: senderUid,
                    notify_type: notifyType,
                    confirm: false,
                  };

                  const newNotify = notificationsRepository.create(notify);
                  const saveNotify = await notificationsRepository.save(
                    newNotify
                  );

                  if (saveNotify) {
                    const existingUser =
                      findSpace.request_users.includes(senderUid);

                    if (existingUser) {
                      return res.status(200).json({
                        message: "중복된 요청입니다.",
                        resultCode: false,
                      });
                    } else {
                      try {
                        findSpace.request_users.push(userUid);

                        const updateSpace = await spaceRepository.save(
                          findSpace
                        );

                        if (updateSpace) {
                          return res.status(200).json({
                            message: "스페이스를 추가 요청 완료하였습니다.",
                            resultCode: true,
                          });
                        } else {
                          return res.status(200).json({
                            message: "스페이스 추가 요청에 실패하였습니다.",
                            resultCode: false,
                          });
                        }
                      } catch (error) {
                        return res.status(500).json({
                          message: "요청 중 오류가 발생하였습니다.",
                          resultCode: false,
                        });
                      }
                    }
                  } else {
                    return res.status(200).json({
                      message: "요청 실패하였습니다.",
                      resultCode: false,
                    });
                  }
                }
              } else if (notifyType === "user") {
                const uid = uuidv4();
                const notify: DeepPartial<Notifications> = {
                  UID: uid,
                  recipient_uid: recipientUid,
                  sender_uid: senderUid,
                  notify_type: notifyType,
                  confirm: false,
                };

                const newNotify = notificationsRepository.create(notify);
                const saveNotify = await notificationsRepository.save(
                  newNotify
                );

                if (saveNotify) {
                  const existingUser =
                    findSpace.invite_users.includes(recipientUid);

                  if (existingUser) {
                    return res.status(200).json({
                      message: "중복된 요청입니다.",
                      resultCode: false,
                    });
                  } else {
                    try {
                      findSpace.invite_users.push(recipientUid);

                      try {
                        const updateSpace = await spaceRepository.save(
                          findSpace
                        );
                        if (updateSpace) {
                          return res.status(200).json({
                            message: "초대 요청 완료하였습니다.",
                            resultCode: true,
                          });
                        } else {
                          return res.status(200).json({
                            message: "초대 요청 실패하였습니다.",
                            resultCode: false,
                          });
                        }
                      } catch (error) {
                        await spaceRepository.delete(findSpace.UID);

                        return res.status(200).json({
                          message: "요청에 실패하였습니다.",
                          resultCode: false,
                        });
                      }
                    } catch (error) {
                      return res.status(500).json({
                        message: "요청 중 오류가 발생하였습니다.",
                        resultCode: false,
                      });
                    }
                  }
                } else {
                  return res.status(200).json({
                    message: "요청 중 에러가 발생하였습니다.",
                    resultCode: false,
                  });
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
