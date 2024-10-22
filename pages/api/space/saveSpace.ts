"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { AppDataSource } from "@database/typeorm.config";
import { Space } from "@entities/Space.entity";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@/server/utils/authenticateToken";
import { DeepPartial } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { SpaceList } from "@entities/SpaceList.entity";
import { Emps } from "@/server/entities/Emps.entity";

export default async function handler(
  req: AuthenticatedRequest & NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }
  const { spaceName } = JSON.parse(req.body);

  authenticateToken(req, res, async () => {
    if (req.user) {
      // 토큰 이용하여 UID GET
      const userUid = req.user.claims.UID;

      try {
        const dataSource = await AppDataSource.useFactory();
        const spaceRepository = dataSource.getRepository(Space);

        const uid = uuidv4();
        const space: DeepPartial<Space> = {
          UID: uid,
          space_name: spaceName,
          space_manager: userUid,
          space_public: true,
          space_users: [],
          create_date: new Date(),
        };

        const newSpace = spaceRepository.create(space);

        const saveSpace = await spaceRepository.save(newSpace);

        if (saveSpace) {
          const spaceListRepository = dataSource.getRepository(SpaceList);

          const findSpaceList = await spaceListRepository.findOne({
            where: { UID: userUid },
          });

          // 사용자의 레벨과 보유한 스페이스 수 확인
          const empsRepository = dataSource.getRepository(Emps);

          const findUser = await empsRepository.findOne({
            where: { UID: userUid },
          });

          if (!findUser || !findSpaceList) {
            return res.status(200).json({
              message: "사용자 정보를 찾을 수 없습니다.",
              resultCode: false,
            });
          }
          if (findSpaceList) {
            if (findUser.user_level === 1 && findSpaceList.space.length >= 3) {
              return res.status(200).json({
                message: "참여할 수 있는 스페이스는 최대 3개입니다.",
                resultCode: false,
              });
            } else {
              findSpaceList.space.push(uid);
              const updateSpaceList = await spaceListRepository.save(
                findSpaceList
              );

              if (updateSpaceList) {
                return res.status(200).json({
                  message: "스페이스가 생성되었습니다.",
                  data: { spaceUid: space.UID },
                  resultCode: true,
                });
              } else {
                if (saveSpace) {
                  await spaceRepository.delete(saveSpace.UID);
                }

                return res.status(200).json({
                  message: "스페이스 생성에 실패하였습니다.",
                  resultCode: false,
                });
              }
            }
          }
        } else {
          return res.status(200).json({
            message: "스페이스 생성에 실패하였습니다.",
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
