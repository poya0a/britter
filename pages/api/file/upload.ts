"use server";
import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { authenticateToken } from "@server/utils/authenticateToken";
import { handleFileUpload } from "@server/utils/fileUpload";

export interface NextApiRequestWithFile extends NextApiRequest {
  file: Express.Multer.File;
}

const upload = multer({
  storage: multer.memoryStorage(),
}).single("file");

export const config = {
  api: {
    bodyParser: false,
  },
};

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다.", resultCode: false });
  }

  authenticateToken(req, res, async () => {
    try {
      await runMiddleware(req, res, upload);

      const reqWithFile = req as NextApiRequestWithFile;

      if (!reqWithFile.file) {
        return res.status(200).json({
          message: "파일을 찾을 수 없습니다.",
          resultCode: false,
        });
      }
      const saveFile = await handleFileUpload(reqWithFile.file);

      if (!saveFile) throw saveFile;

      if (saveFile.data) {
        return res.status(200).json({
          message: "파일 업로드가 완료되었습니다.",
          resultCode: true,
          data: {
            seq: saveFile.data.seq,
            path: saveFile.data.path,
          },
        });
      } else {
        return res.status(200).json({
          message: saveFile.message,
          resultCode: false,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "서버 에러가 발생하였습니다.",
        error: error,
        resultCode: false,
      });
    }
  });
}
