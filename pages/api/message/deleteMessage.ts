"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { getDataSource } from "@database/typeorm.config";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@server/utils/authenticateToken";
import { Message } from "@entities/Message.entity";

export default async function handler(
  req: AuthenticatedRequest & NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }
  const { messageUid } = JSON.parse(req.body);

  authenticateToken(req, res, async () => {
    if (req.user) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;

      try {
        const dataSource = await getDataSource();
        const messageRepository = dataSource.getRepository(Message);

        const findMessage = await messageRepository.findOne({
          where: { UID: messageUid },
        });

        if (findMessage) {
          if (findMessage.sender_uid === uid) {
            await messageRepository.delete(findMessage.UID);

            return res.status(200).json({
              message: "메시지가 삭제되었습니다.",
              data: { uid: findMessage.UID },
              resultCode: true,
            });
          } else {
            return res.status(200).json({
              message: "메시지는 작성자만 삭제할 수 있습니다.",
              resultCode: false,
            });
          }
        } else {
          return res.status(200).json({
            message: "삭제된 메시지입니다.",
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
