import { AppDataSource } from "@database/typeorm.config";
import { File } from "@entities/File.entity";
import fs from "fs";
import path from "path";

export async function handleFileUpload(file: Express.Multer.File) {
  try {
    if (!file) {
      throw new Error("업로드할 파일이 없습니다.");
    }

    const dataSource = await AppDataSource.useFactory();
    const fileRepository = dataSource.getRepository(File);

    const filePath = file.path;
    const fileName = file.originalname;
    const fileSize = file.size;
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

    return {
      resultCode: true,
      message: "파일 업로드가 완료되었습니다.",
      seq: savedFile.seq,
    };
  } catch (error) {
    throw new Error("파일 업로드 중 오류가 발생하였습니다.");
  }
}
