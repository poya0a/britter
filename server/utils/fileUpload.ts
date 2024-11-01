import { AppDataSource } from "@database/typeorm.config";
import { File } from "@entities/File.entity";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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

    const dataSource = await AppDataSource.useFactory();
    const fileRepository = dataSource.getRepository(File);

    const fileSize = file.size;
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const baseFileName = path.basename(file.originalname, fileExtension);
    const uploadDirectory = path.join(process.cwd(), "public/files");

    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory, { recursive: true });
    }

    // 고유 파일명 생성
    const uniqueId = uuidv4();
    const fileName = `${baseFileName}_${uniqueId}${fileExtension}`;
    const savedFilePath = path.join(uploadDirectory, fileName);

    fs.renameSync(file.path, savedFilePath);

    const fileBuffer = fs.readFileSync(savedFilePath);

    const newFile = new File();
    newFile.file = fileBuffer;
    newFile.file_name = path.basename(savedFilePath);
    newFile.file_path = `/files/${fileName}`;
    newFile.file_size = fileSize.toString();
    newFile.file_extension = fileExtension;

    const savedFile = await fileRepository.save(newFile);

    return {
      resultCode: true,
      message: "파일 업로드가 완료되었습니다.",
      data: {
        seq: savedFile.seq,
        path: savedFile.file_path,
      },
    };
  } catch (error) {
    throw new Error("파일 업로드 중 오류가 발생하였습니다.");
  }
}
