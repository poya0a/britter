"use server";
import { NextApiResponse } from "next";
import { getDataSource } from "@database/typeorm.config";
import { Space } from "@entities/Space.entity";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@server/utils/authenticateToken";
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
    return res
      .status(405)
      .json({ message: "잘못된 메소드입니다.", resultCode: false });
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

          // 토큰 이용하여 UID GET
          const uid = req.user.claims.UID;

          if (!fields.space) {
            return res.status(200).json({
              message: "스페이스 정보를 찾을 수 없습니다. 다시 시도해 주세요.",
              resultCode: false,
            });
          }

          if (!fields.content) {
            return res.status(200).json({
              message: "콘텐츠 내용을 입력해 주세요.",
              resultCode: false,
            });
          }

          // 저장하는 스페이스에 권한이 있는지 체크
          const spaceUid: string = fields.space[0];
          const spaceContent: string = fields.content[0];
          const spaceRepository = dataSource.getRepository(Space);

          const findSpace = await spaceRepository.findOne({
            where: { UID: spaceUid },
          });

          if (findSpace) {
            if (
              findSpace.space_manager === uid ||
              findSpace.space_users.includes(uid)
            ) {
              findSpace.space_content = spaceContent;

              await spaceRepository.save(findSpace);

              return res.status(200).json({
                message: "콘텐츠가 저장되었습니다.",
                data: { uid: findSpace.UID },
                resultCode: true,
              });
            } else {
              return res.status(200).json({
                message: "콘텐츠 작성 권한이 없습니다.",
                resultCode: false,
              });
            }
          } else {
            return res.status(200).json({
              message: "스페이스 정보를 찾을 수 없습니다. 다시 시도해 주세요.",
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
