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

export default async function handler(req: NextApiRequestWithFormData, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다.", resultCode: false });
  }

  authenticateToken(req, res, async () => {
    if (req.user) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;

      await runMiddleware(req, res, upload);
      const { spaceUid, spaceName, spacePublic } = req.body;
      const file: Express.Multer.File | undefined = req.file;

      try {
        const { data: space, error: spaceError } = await supabase
          .from("space")
          .select("*")
          .eq("UID", spaceUid)
          .eq("space_manager", uid)
          .single();

        if (spaceError) {
          return res.status(200).json({
            message: "스페이스 정보를 찾을 수 없습니다. 다시 시도해 주세요.",
            error: spaceError,
            resultCode: false,
          });
        }

        if (spaceName) {
          const { data: existingSpaces, error: nameCheckError } = await supabase
            .from("space")
            .select("*")
            .eq("space_name", spaceName);

          if (nameCheckError) {
            return res.status(200).json({
              message: "서버 에러가 발생하였습니다.",
              resultCode: false,
            });
          }

          if (existingSpaces.length > 0) {
            return res.status(200).json({
              message: "이미 존재하는 스페이스 이름입니다. 다시 입력해 주세요.",
              resultCode: false,
            });
          }
          space.space_name = spaceName;
        }

        if (spacePublic !== undefined) {
          space.space_public = spacePublic === "true" ? true : false;
        }

        if (file) {
          if (space.space_profile_seq) {
            await handleFileDelete(space.space_profile_seq);
          }

          const saveFile = await handleFileUpload(file);

          if (!saveFile) throw saveFile;

          space.space_profile_seq = saveFile.data?.seq || 0;
        }

        const { error: updateError } = await supabase
          .from("space")
          .update(space)
          .eq("UID", spaceUid)
          .eq("space_manager", uid);

        if (updateError) {
          return res.status(200).json({
            message: "정보 수정에 실패하였습니다.",
            resultCode: false,
          });
        }

        return res.status(200).json({
          message: "스페이스 정보 수정되었습니다.",
          data: { seq: spaceUid },
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
