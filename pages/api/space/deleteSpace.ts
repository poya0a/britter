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
import { Post } from "@/server/entities/Post.entity";

export default async function handler(
  req: AuthenticatedRequest & NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }
  const { spaceUid } = JSON.parse(req.body);

  authenticateToken(req, res, async () => {
    if (req.user) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;

      try {
        const dataSource = await AppDataSource.useFactory();
        const spaceRepository = dataSource.getRepository(Space);
        const spaceListRepository = dataSource.getRepository(SpaceList);
        const postRepository = dataSource.getRepository(Post);

        const findSpace = await spaceRepository.findOne({
          where: { UID: spaceUid, space_manager: uid },
        });

        const findSpaceList = await spaceListRepository.findOne({
          where: { UID: uid },
        });

        if (!findSpace || !findSpaceList) {
          return res.status(200).json({
            message: "삭제할 스페이스를 찾을 수 없습니다.",
            resultCode: false,
          });
        }

        // 스페이스가 하나인 경우 삭제 불가
        if (findSpaceList.space.length <= 1) {
          return res.status(200).json({
            message: "최소한 하나의 스페이스를 가지고 있어야 합니다.",
            resultCode: false,
          });
        } else {
          // 사용자의 스페이스 리스트에서 삭제
          findSpaceList.space = findSpaceList.space.filter(
            (space: string) => space !== spaceUid
          );

          await spaceListRepository.save(findSpaceList);
        }

        // 해당 스페이스를 가진 사람의 스페이스 리스트에서 삭제
        const spaceUsers = findSpace.space_users;
        for (const userUid of spaceUsers) {
          const userSpaceList = await spaceListRepository.findOne({
            where: { UID: userUid },
          });

          if (userSpaceList) {
            userSpaceList.space = userSpaceList.space.filter(
              (spaceId: string) => spaceId !== spaceUid
            );

            await spaceListRepository.save(userSpaceList);
          }
        }

        // 해당 스페이스의 게시글 삭제
        const findPosts = await postRepository.find({
          where: { space_uid: spaceUid },
        });

        if (findPosts) {
          await postRepository.remove(findPosts);
        }

        await spaceRepository.remove(findSpace);

        return res.status(200).json({
          message: "스페이스가 성공적으로 삭제되었습니다.",
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
