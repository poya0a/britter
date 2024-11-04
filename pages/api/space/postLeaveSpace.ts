"use server";
import { NextApiResponse } from "next";
import { getDataSource } from "@database/typeorm.config";
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
          const dataSource = await getDataSource();
          const notificationsRepository =
            dataSource.getRepository(Notifications);
          const spaceRepository = dataSource.getRepository(Space);
          const spaceListRepository = dataSource.getRepository(SpaceList);
          const empsRepository = dataSource.getRepository(Emps);
          const findUser = await empsRepository.findOne({
            where: { UID: userUid },
          });

          if (!findUser) {
            return res.status(200).json({
              message: "사용자 정보를 찾을 수 없습니다.",
              resultCode: false,
            });
          }

          if (fields.exitType && fields.senderUid && fields.exitUid) {
            const exitType: string = fields.exitType[0];
            const senderUid: string = fields.senderUid[0];
            const exitUid: string = fields.exitUid[0];

            const findSpace = await spaceRepository.findOne({
              where: { UID: exitType === "space" ? exitUid : senderUid },
            });

            const findSpaceList = await spaceListRepository.findOne({
              where: { UID: exitType === "space" ? senderUid : exitUid },
            });

            if (!findSpace || !findSpaceList) {
              return res.status(200).json({
                message: "스페이스 정보를 찾을 수 없습니다.",
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

              const findExitSpaceInUser = findSpace.space_users.find(
                (user) => user === senderUid
              );
              const findExitSpaceListInUser = findSpaceList.space.find(
                (user) => user === exitUid
              );

              if (!findExitSpaceInUser || !findExitSpaceListInUser) {
                return res.status(200).json({
                  message: "요청 값이 올바르지 않습니다.",
                  resultCode: false,
                });
              }

              findSpace.space_users = findSpace.space_users.filter(
                (user) => user !== senderUid
              );

              findSpaceList.space = findSpaceList.space.filter(
                (user) => user !== exitUid
              );

              // 멤버 탈퇴 알림 저장
              const uid = uuidv4();

              const notify: DeepPartial<Notifications> = {
                UID: uid,
                recipient_uid: exitUid,
                sender_uid: senderUid,
                notify_type: "memberOut",
                confirm: false,
              };

              const newNotify = notificationsRepository.create(notify);
              await notificationsRepository.save(newNotify);
              await spaceRepository.save(findSpace);
              await spaceListRepository.save(findSpaceList);

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

              const findExitSpaceInUser = findSpace.space_users.find(
                (user) => user === exitUid
              );
              const findExitSpaceListInUser = findSpaceList.space.find(
                (user) => user === senderUid
              );

              if (!findExitSpaceInUser || !findExitSpaceListInUser) {
                return res.status(200).json({
                  message: "요청 값이 올바르지 않습니다.",
                  resultCode: false,
                });
              }

              findSpace.space_users = findSpace.space_users.filter(
                (user) => user !== exitUid
              );

              findSpaceList.space = findSpaceList.space.filter(
                (user) => user !== senderUid
              );

              // 멤버 탈퇴 알림 저장
              const uid = uuidv4();

              const notify: DeepPartial<Notifications> = {
                UID: uid,
                recipient_uid: exitUid,
                sender_uid: senderUid,
                notify_type: "memberOut",
                confirm: false,
              };

              const newNotify = notificationsRepository.create(notify);
              await notificationsRepository.save(newNotify);
              await spaceRepository.save(findSpace);
              await spaceListRepository.save(findSpaceList);

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
