"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { getDataSource } from "@database/typeorm.config";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@server/utils/authenticateToken";
import { Message } from "@entities/Message.entity";
import { Emps } from "@entities/Emps.entity";

export default async function handler(
  req: AuthenticatedRequest & NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  authenticateToken(req, res, async () => {
    if (req.user) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;

      try {
        const messageUid = req.query.messageUid;
        const dataSource = await getDataSource();

        const messageRepository = dataSource.getRepository(Message);
        const empsRepository = dataSource.getRepository(Emps);

        if (messageUid && typeof messageUid === "string" && messageUid !== "") {
          const findMessage = await messageRepository.findOne({
            where: {
              UID: messageUid,
            },
          });

          if (findMessage) {
            const findName = await empsRepository.findOne({
              where: {
                UID:
                  findMessage.sender_uid === uid
                    ? findMessage.recipient_uid
                    : findMessage.sender_uid,
              },
              select: ["user_name"],
            });

            const messageListWithName = {
              ...findMessage,
              name: findName?.user_name,
            };

            return res.status(200).json({
              message: "메시지 조회 완료했습니다.",
              data: messageListWithName,
              resultCode: true,
            });
          } else {
            return res.status(200).json({
              message: "삭제된 메시지입니다.",
              resultCode: false,
            });
          }
        } else {
          return res.status(200).json({
            message: "메시지 정보가 올바르지 않습니다.",
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
}
