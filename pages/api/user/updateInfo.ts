"use server";
import { NextApiResponse, NextApiRequest } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";
import multer from "multer";
import { handleFileUpload } from "@server/utils/fileUpload";
import { handleFileDelete } from "@server/utils/fileDelete";

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
  storage: multer.memoryStorage(),
}).single("userProfile");

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

export default async function handler(req: NextApiRequestWithFormData, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다.", resultCode: false });
  }

  authenticateToken(req, res, async () => {
    if (req.user) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;

      await runMiddleware(req, res, upload);

      const { userName, userEmail, userBirth, statusEmoji, statusMessage, userPublic } = req.body;
      const file: Express.Multer.File | undefined = req.file;

      try {
        if (!uid) {
          return res.status(200).json({
            message: "사용자 정보를 찾을 수 없습니다.",
            resultCode: false,
          });
        }

        const { data: findUser, error: userError } = await supabase.from("emps").select("*").eq("UID", uid).single();

        if (userError) {
          return res.status(200).json({
            message: "사용자 정보를 찾을 수 없습니다.",
            resultCode: false,
          });
        }
        if (userName) {
          findUser.user_name = JSON.parse(userName);
        }
        if (userEmail) {
          findUser.user_email = JSON.parse(userEmail);
        }
        if (userBirth) {
          findUser.user_birth = JSON.parse(userBirth);
        }
        if (statusEmoji) {
          findUser.status_emoji = JSON.parse(statusEmoji);
        }
        if (statusMessage) {
          findUser.status_message = JSON.parse(statusMessage);
        }
        if (userPublic) {
          findUser.user_public = userPublic === "true" ? true : false;
        }

        const existingProfileSeq: number | null = findUser.user_profile_seq === 0 ? null : findUser.user_profile_seq;

        if (file !== undefined) {
          const saveFile = await handleFileUpload(file);

          if (!saveFile) throw saveFile;

          findUser.user_profile_seq = saveFile.data?.seq || 0;
        }

        const { error: updateError } = await supabase.from("emps").upsert(findUser);

        if (existingProfileSeq) {
          await handleFileDelete(existingProfileSeq);
        }

        if (updateError) {
          return res.status(200).json({
            message: "정보 수정에 실패하였습니다.",
            resultCode: false,
          });
        }

        return res.status(200).json({
          message: "사용자 정보가 수정되었습니다.",
          resultCode: true,
        });
      } catch (error) {
        return res.status(500).json({
          message: "서버 에러가 발생하였습니다.",
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
