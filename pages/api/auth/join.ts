"use server";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import multer from "multer";
import { AppDataSource } from "@database/typeorm.config";
import { Emps } from "@entities/Emps.entity";
import { getErrorMassage } from "@utils/errorMessage";
import { regexValue } from "@utils/regex";
import { validationRules } from "@utils/errorMessage";
import { DeepPartial } from "typeorm";
import { EmpsInterface } from "@models/Emps.model";
import { handleFileUpload } from "@/server/utils/fileUpload";
import { Space } from "@entities/Space.entity";
import { Terms } from "@entities/Terms.entity";
import { SpaceList } from "@/server/entities/SpaceList.entity";

type NextApiRequestWithFormData = NextApiRequest &
  Request & {
    file: Express.Multer.File;
  };

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDirectory = path.join(process.cwd(), "public/files");
      if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, { recursive: true });
      }
      cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
}).single("user_profile");

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

const requiredField = [
  "user_id",
  "user_pw",
  "user_name",
  "user_hp",
  "user_certification",
];

export default async function handler(
  req: NextApiRequestWithFormData,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "잘못된 메소드입니다.", resultCode: false });
  }
  await runMiddleware(req, res, upload);

  const data: Partial<EmpsInterface> = req.body;
  const file: Express.Multer.File | undefined = req.file;

  // 빈 값 확인
  const emptyFields = requiredField.filter(
    (fieldName) =>
      data[fieldName as keyof EmpsInterface] === undefined ||
      data[fieldName as keyof EmpsInterface] === "" ||
      data[fieldName as keyof EmpsInterface] === null
  );

  if (emptyFields.length > 0) {
    return res.status(200).json({
      message: getErrorMassage(emptyFields[0]),
      resultCode: false,
    });
  }

  // 필수 이용 약관 동의 확인
  try {
    const dataSource = await AppDataSource.useFactory();
    const termsRepository = dataSource.getRepository(Terms);
    const terms = await termsRepository.find({
      where: {
        in_used: true,
        required: true,
      },
    });

    const requiredTermsIds = terms.map((term) => term.seq);
    const agreedTermsIds = data.terms;

    if (!agreedTermsIds) {
      return res.status(200).json({
        message: "필수 이용약관에 동의해 주세요.",
        resultCode: false,
      });
    }

    const hasAgreedToAllRequiredTerms = requiredTermsIds.every((seq: number) =>
      agreedTermsIds.includes(seq.toString())
    );

    if (!hasAgreedToAllRequiredTerms) {
      return res.status(200).json({
        message: "필수 이용약관에 동의해 주세요.",
        resultCode: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "서버 에러가 발생하였습니다.",
      error: error,
      resultCode: false,
    });
  }

  // 유효성 검사
  const errorMessages = Object.keys(data).reduce(
    (
      errors: Partial<{ [key in keyof EmpsInterface]: string }>,
      fieldName: string
    ) => {
      if (requiredField.includes(fieldName)) {
        const patternInfo = validationRules[fieldName as keyof EmpsInterface];
        if (patternInfo) {
          const sanitizedValue = regexValue(
            patternInfo.pattern,
            data[fieldName as keyof EmpsInterface]
          ) as EmpsInterface[keyof EmpsInterface];
          if (!sanitizedValue) {
            errors[fieldName as keyof EmpsInterface] = patternInfo.errorMessage;
          }
        }
      }
      return errors;
    },
    {}
  );

  if (Object.keys(errorMessages).length > 0) {
    const keys = Object.keys(errorMessages) as Array<keyof EmpsInterface>;
    return res.status(200).json({
      message: errorMessages[keys[0]],
      resultCode: false,
    });
  }

  try {
    const dataSource = await AppDataSource.useFactory();
    const empsRepository = dataSource.getRepository(Emps);
    const existingId = await empsRepository.findOne({
      where: { user_id: data.user_id },
    });

    const existinghp = await empsRepository.findOne({
      where: { user_hp: data.user_hp },
    });

    const existingEmail = await empsRepository.findOne({
      where: { user_email: data.user_email },
    });

    if (existingId || existinghp || existingEmail) {
      let name = "";
      if (existingId) {
        name = "아이디";
      } else if (existinghp) {
        name = "휴대전화 번호";
      } else if (existingEmail) {
        name = "이메일";
      }
      return res
        .status(200)
        .json({ message: `이미 사용 중인 ${name}입니다.`, resultCode: false });
    }

    const hashedPassword = await bcrypt.hash(data.user_pw!, 10);

    const emp: DeepPartial<Emps> = {
      UID: uuidv4(),
      user_profile_seq: 0,
      user_id: data.user_id,
      user_pw: hashedPassword,
      user_name: data.user_name,
      user_hp: data.user_hp,
      user_certification: data.user_certification,
      user_email: data.user_email ? data.user_email : undefined,
      user_nick_name: data.user_nick_name
        ? data.user_nick_name
        : generateRandomString(),
      user_birth: data.user_birth ? data.user_birth : undefined,
      user_public: data.user_public ? data.user_public : true,
      user_level: 1,
      create_date: new Date(),
      terms: data.terms,
    };

    const newUser = empsRepository.create(emp);
    const saveUser = await empsRepository.save(newUser);

    // 개인 스페이스 생성
    const spaceRepository = dataSource.getRepository(Space);

    const space: DeepPartial<Space> = {
      UID: uuidv4(),
      space_profile_seq: null,
      space_name: emp.user_nick_name,
      space_manager: emp.UID,
      space_public: emp.user_public,
      space_users: [],
      invite_users: [],
      request_users: [],
      create_date: new Date(),
    };

    const newSpace = spaceRepository.create(space);
    const saveSpace = await spaceRepository.save(newSpace);

    if (saveUser && saveSpace) {
      // 스페이스 리스트 생성
      const spaceListRepository = dataSource.getRepository(SpaceList);

      const spaceList: DeepPartial<SpaceList> = {
        UID: emp.UID,
        space: [`${space.UID}`],
      };

      const newSpaceList = spaceListRepository.create(spaceList);
      const saveSpaceList = await spaceListRepository.save(newSpaceList);

      if (saveSpaceList) {
        if (file !== undefined) {
          const saveFile = await handleFileUpload(file);

          // 프로필 업데이트
          saveUser.user_profile_seq = saveFile.seq;
          const updateUser = await empsRepository.save(saveUser);

          if (updateUser) {
            return res.status(200).json({
              message: "회원 가입이 완료되었습니다.",
              resultCode: true,
            });
          } else {
            return res.status(200).json({
              message:
                "프로필 이미지 저장에 실패하였습니다. 개인 정보 수정에서 다시 시도해 주세요.",
              resultCode: false,
            });
          }
        } else {
          return res.status(200).json({
            message: "회원 가입이 완료되었습니다.",
            resultCode: true,
          });
        }
      } else {
        return res.status(200).json({
          message: "회원 가입에 실패하였습니다. 다시 시도해 주세요.",
          resultCode: true,
        });
      }
    } else {
      // 실패 시 정보 삭제 처리
      if (saveUser) {
        await empsRepository.delete(saveUser.UID);
      }

      if (saveSpace) {
        await spaceRepository.delete(saveSpace.UID);
      }

      return res.status(200).json({
        message: "회원 가입에 실패하였습니다. 다시 시도해 주세요.",
        resultCode: true,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "서버 에러가 발생하였습니다.",
      error: error,
      resultCode: false,
    });
  }
}

function generateRandomString(length = 8) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(randomIndex);
  }

  return result;
}
