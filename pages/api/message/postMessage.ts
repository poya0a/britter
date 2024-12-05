"use server";
import { NextApiResponse } from "next";
import { getDataSource } from "@database/typeorm.config";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@/server/utils/authenticateToken";
import { DeepPartial } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import formidable from "formidable";
import { Emps } from "@entities/Emps.entity";
import { Message } from "@entities/Message.entity";

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
        try {
          const dataSource = await getDataSource();
          const messageRepository = dataSource.getRepository(Message);
          const empsRepository = dataSource.getRepository(Emps);

          // 토큰 이용하여 UID GET
          const uid = req.user.claims.UID;

          if (uid && fields.recipientUid && fields.message) {
            const recipientUid: string = fields.recipientUid[0];
            const messageText: string = fields.message[0];

            const findUser = await empsRepository.findOne({
              where: { UID: recipientUid },
            });

            if (!findUser) {
              return res.status(200).json({
                message: "받는 사람 정보를 찾을 수 없습니다.",
                resultCode: false,
              });
            }

            const uuid = uuidv4();

            const message: DeepPartial<Message> = {
              UID: uuid,
              recipient_uid: recipientUid,
              sender_uid: uid,
              message: messageText,
              confirm: false,
              create_date: new Date(),
            };

            const newMessage = messageRepository.create(message);

            const saveMessage = await messageRepository.save(newMessage);

            if (saveMessage) {
              return res.status(200).json({
                message: "메시지가 전송되었습니다.",
                resultCode: true,
              });
            } else {
              return res.status(200).json({
                message: "메시지 전송에 실패하였습니다.",
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
