import supabase from "@database/supabase.config";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

config();

/**
 * @param file
 * @returns
 */

const { NEXT_PUBLIC_STORAGE_BUCKET } = process.env;

export async function handleFileUpload(file: Express.Multer.File) {
  try {
    if (!file) {
      return {
        resultCode: false,
        message: "업로드할 파일이 없습니다.",
      };
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      return {
        resultCode: false,
        message: "파일 크기가 5MB를 초과합니다.",
      };
    }

    if (!NEXT_PUBLIC_STORAGE_BUCKET) {
      return {
        resultCode: false,
        message: "파일 업로드 중 오류가 발생하였습니다.",
      };
    }

    const fileSize = file.size;
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const baseFileName = path.basename(file.originalname, fileExtension);

    // 고유 파일명 생성
    const uniqueId = uuidv4();
    const fileName = `${baseFileName}_${uniqueId}${fileExtension}`;

    const { data: uploadFile, error: uploadError } = await supabase.storage.from("files").upload(fileName, file.buffer);

    if (uploadError) {
      return {
        resultCode: false,
        message: "파일 업로드 중 오류가 발생하였습니다.",
        error: uploadError,
      };
    }

    const { data: publicUrlData } = supabase.storage.from("files").getPublicUrl(uploadFile.path);

    const newFile = {
      file_name: fileName,
      file_path: publicUrlData.publicUrl,
      file_size: fileSize.toString(),
      file_extension: fileExtension,
    };

    const { error: fileError } = await supabase.from("file").insert(newFile).single();

    if (fileError) {
      return {
        resultCode: false,
        message: "파일 업로드 중 오류가 발생하였습니다.",
        error: fileError,
      };
    }

    const { data } = await supabase.from("file").select("*").eq("file_path", newFile.file_path).single();

    return {
      resultCode: true,
      message: "파일 업로드가 완료되었습니다.",
      data: {
        seq: data.seq,
        path: data.file_path,
      },
    };
  } catch (error) {
    throw new Error("파일 업로드 중 오류가 발생하였습니다.");
  }
}
