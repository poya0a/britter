"use server";
import { NextApiRequest, NextApiResponse } from "next";
import { AppDataSource } from "@database/typeorm.config";
import { File } from "@entities/File.entity";
import multer from "multer";
import fs from "fs";
import path from "path";
import { authenticateToken } from "@/server/utils/authenticateToken";

export interface NextApiRequestWithFile extends NextApiRequest {
  file: Express.Multer.File;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDirectory = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, { recursive: true });
      }
      cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "잘못된 메소드입니다.", resultCode: false });
  }

  authenticateToken(req, res, async () => {
    try {
      await runMiddleware(req, res, upload);

      const reqWithFile = req as NextApiRequestWithFile;
      if (!reqWithFile.file) {
        throw new Error("파일이 없습니다.");
      }

      const dataSource = await AppDataSource.useFactory();
      const fileRepository = dataSource.getRepository(File);

      const filePath = reqWithFile.file.path;
      const fileName = reqWithFile.file.originalname;
      const fileSize = reqWithFile.file.size;
      const fileExtension = path.extname(fileName).toLowerCase();

      const fileBuffer = fs.readFileSync(filePath);

      const uploadDirectory = path.join(process.cwd(), "files");
      if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, { recursive: true });
      }

      const savedFilePath = path.join(uploadDirectory, fileName);
      fs.writeFileSync(savedFilePath, fileBuffer);

      const newFile = new File();
      newFile.file = fileBuffer;
      newFile.file_name = fileName;
      newFile.file_path = savedFilePath;
      newFile.file_size = fileSize.toString();
      newFile.file_extension = fileExtension;

      const savedFile = await fileRepository.save(newFile);

      return res.status(200).json({
        message: "파일 업로드가 완료되었습니다.",
        resultCode: true,
        data: {
          seq: savedFile.seq,
          path: savedFile.file_path,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "서버 에러가 발생하였습니다.",
        error: error,
        resultCode: false,
      });
    }
  });
}
