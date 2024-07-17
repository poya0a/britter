"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { AppDataSource } from "@database/typeorm.config";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@/server/utils/authenticateToken";
import { Space } from "@entities/Space.entity";
import fs from "fs";
import path from "path";
import multer from "multer";
import { handleFileUpload } from "@/server/utils/fileUpload";
import { handleFileDelete } from "@/server/utils/fileDelete";

type NextApiRequestWithFormData = NextApiRequest &
  AuthenticatedRequest &
  Request & {
    file: Express.Multer.File;
  };

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDirectory = path.join(process.cwd(), "public/files");
      if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, { recursive: true });
      }
      cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
}).single("spaceProfile");

const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve(result);
    });
  });
};

export default async function handler(
  req: NextApiRequestWithFormData,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "잘못된 메소드입니다.", resultCode: false });
  }

  authenticateToken(req, res, async () => {
    if (req.user) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;

      await runMiddleware(req, res, upload);
      const { spaceUid, spaceName, spacePublic } = req.body;
      const file: Express.Multer.File | undefined = req.file;

      try {
        const dataSource = await AppDataSource.useFactory();
        const spaceRepository = dataSource.getRepository(Space);

        if (!spaceUid) {
          return res.status(200).json({
            message: "스페이스를 찾을 수 없습니다.",
            resultCode: false,
          });
        }

        const findSpace = await spaceRepository.findOne({
          where: { UID: JSON.parse(spaceUid), space_manager: uid },
        });

        if (findSpace) {
          if (spaceName) {
            findSpace.space_name = JSON.parse(spaceName);
          }

          if (spacePublic) {
            findSpace.space_public = spacePublic === "true" ? true : false;
          }

          if (file !== undefined) {
            if (findSpace.space_profile_seq) {
              await handleFileDelete(findSpace.space_profile_seq);
            }
            const saveFile = await handleFileUpload(file);
            findSpace.space_profile_seq = saveFile.seq;
          }

          const updateSpace = await spaceRepository.save(findSpace);

          if (updateSpace) {
            return res.status(200).json({
              message: "스페이스 정보 수정되었습니다.",
              data: { seq: spaceUid },
              resultCode: true,
            });
          } else {
            return res.status(200).json({
              message: "정보 수정에 실패하였습니니다.",
              resultCode: false,
            });
          }
        } else {
          return res.status(200).json({
            message: "스페이스를 찾을 수 없습니다.",
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
