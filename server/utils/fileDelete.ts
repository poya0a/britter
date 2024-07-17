import { AppDataSource } from "@database/typeorm.config";
import { File } from "@entities/File.entity";
import { Space } from "@entities/Space.entity";
import fs from "fs";
import path from "path";

export async function handleFileDelete(spaceProfileSeq: number) {
  try {
    const dataSource = await AppDataSource.useFactory();
    const fileRepository = dataSource.getRepository(File);
    const spaceRepository = dataSource.getRepository(Space);

    await spaceRepository.update(
      { space_profile_seq: spaceProfileSeq },
      { space_profile_seq: null }
    );

    const findFile = await fileRepository.findOne({
      where: { seq: spaceProfileSeq },
    });

    if (findFile) {
      const filePath = path.join(
        process.cwd(),
        "public/files",
        findFile.file_path
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await fileRepository.remove(findFile);
    } else {
      throw new Error("삭제할 파일을 찾을 수 없습니다.");
    }
  } catch (error) {
    console.log(error);
    throw new Error("파일 삭제 중 오류가 발생하였습니다.");
  }
}
