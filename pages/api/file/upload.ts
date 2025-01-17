"use server";
import { NextApiRequest, NextApiResponse } from "next";
import { authenticateToken } from "@server/utils/authenticateToken";
import { handleFileUpload } from "@server/utils/fileUpload";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다.", resultCode: false });
  }

  const { file } = JSON.parse(req.body);

  authenticateToken(req, res, async () => {
    try {
      if (!file) {
        return res.status(200).json({
          message: "파일을 찾을 수 없습니다.",
          resultCode: false,
        });
      }
      const saveFile = await handleFileUpload(file);

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
      return res.status(200).json({
        message: "서버 에러가 발생하였습니다.",
        error: error,
        resultCode: false,
      });
    }
  });
}
