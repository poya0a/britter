import supabase from "@database/supabase.config";
import fs from "fs";
import path from "path";

export async function handleFileDelete(fileSeq: number) {
  try {
    const { data: findFile } = await supabase.from("file").select("file_path").eq("seq", fileSeq).single();

    if (findFile) {
      const filePath = path.join(process.cwd(), "public", findFile.file_path);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await supabase.from("file").delete().eq("seq", fileSeq);
    }
    // else {
    //     throw new Error("삭제할 파일을 찾을 수 없습니다.");
    //   }
  } catch (error) {
    throw new Error("파일 삭제 중 오류가 발생하였습니다.");
  }
}
