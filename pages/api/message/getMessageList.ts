"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { Like } from "typeorm";
import { getDataSource } from "@database/typeorm.config";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@server/utils/authenticateToken";
import { Emps } from "@entities/Emps.entity";
import { Message } from "@entities/Message.entity";

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
        const messageType = req.query.type;
        const pageNumber = parseInt(req.query.page as string);
        const searchWord = req.query.searchWord;
        const dataSource = await getDataSource();

        const messageRepository = dataSource.getRepository(Message);
        const empsRepository = dataSource.getRepository(Emps);

        let whereCondition: object =
          messageType === "receivedMessage"
            ? { recipient_uid: uid }
            : { sender_uid: uid };

        if (searchWord) {
          whereCondition = {
            ...whereCondition,
            message: Like(`%${searchWord}%`),
          };
        }

        const [findMessageList, totalCount] =
          await messageRepository.findAndCount({
            where: whereCondition,
            skip: (pageNumber - 1) * 20,
            take: 20,
            order: {
              create_date: "DESC",
            },
          });

        const messageListWithName = await Promise.all(
          findMessageList.map(async (message) => {
            const findName = await empsRepository.findOne({
              where: {
                UID:
                  message.sender_uid === uid
                    ? message.recipient_uid
                    : message.sender_uid,
              },
              select: ["user_name"],
            });
            return {
              ...message,
              message:
                message.message.length <= 100
                  ? message.message
                  : message.message.slice(0, 100) + "...",
              name: findName?.user_name,
            };
          })
        );

        const totalPages = Math.ceil(totalCount / 20);

        const pageInfo = {
          currentPage: pageNumber,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: 20,
        };

        // 안 읽은 메시지 수
        const [_, unreadMessageTotalCount] =
          await messageRepository.findAndCount({
            where: { recipient_uid: uid, confirm: false },
          });

        return res.status(200).json({
          message: "메시지 목록 조회 완료했습니다.",
          data: messageListWithName ? messageListWithName : [],
          pageInfo: pageInfo,
          unreadMessageCount:
            unreadMessageTotalCount > 0 ? unreadMessageTotalCount : null,
          resultCode: true,
        });
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
