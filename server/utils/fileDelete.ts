import supabase from "@database/supabase.config";
import { config } from "dotenv";

/**
 * @param fileSeq
 * @returns
 */

config();
const { NEXT_PUBLIC_STORAGE_BUCKET } = process.env;

export async function handleFileDelete(fileSeq: number) {
  try {
    const { data: findFile, error: findError } = await supabase
      .from("file")
      .select("file_name")
      .eq("seq", fileSeq)
      .single();

    if (findError || !NEXT_PUBLIC_STORAGE_BUCKET) {
      return {
        resultCode: false,
        message: "파일 정보를 가져오는 중 오류가 발생하였습니다.",
        error: findError,
      };
    }

    const { error: storageError } = await supabase.storage.from(NEXT_PUBLIC_STORAGE_BUCKET).remove(findFile.file_name);

    if (storageError) {
      return {
        resultCode: false,
        message: "파일 삭제 중 오류가 발생하였습니다.",
        error: storageError.message,
      };
    }

    await supabase.from("file").delete().eq("seq", fileSeq);
  } catch (error) {
    throw new Error("파일 삭제 중 오류가 발생하였습니다.");
  }
}
