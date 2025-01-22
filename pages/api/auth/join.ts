"use server";
import { NextApiRequest, NextApiResponse } from "next";
import supabase from "@database/supabase.config";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import multer from "multer";
import { getErrorMassage } from "@utils/errorMessage";
import { regexValue } from "@utils/regex";
import { validationRules } from "@utils/errorMessage";
import { EmpsInterface } from "@models/Emps.model";
import { handleFileUpload } from "@server/utils/fileUpload";

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
  storage: multer.memoryStorage(),
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

const requiredField = ["user_id", "user_pw", "user_name", "user_hp", "user_certification"];

export default async function handler(req: NextApiRequestWithFormData, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다.", resultCode: false });
  }
  await runMiddleware(req, res, upload);

  const { user_id, user_pw, user_name, user_hp, user_certification, user_email, user_birth, terms } = req.body;
  const file: Express.Multer.File | undefined = req.file;

  // 빈 값 확인
  const emptyFields = requiredField.filter(
    (fieldName) =>
      req.body[fieldName as keyof EmpsInterface] === undefined ||
      req.body[fieldName as keyof EmpsInterface] === "" ||
      req.body[fieldName as keyof EmpsInterface] === null
  );

  if (emptyFields.length > 0) {
    // return res.status(200).json({
    //   message: getErrorMassage(emptyFields[0]),
    //   resultCode: false,
    // });
  }

  // 필수 이용 약관 동의 확인
  const termsList: number[] = terms?.map((term: number) => term) || [];

  if (termsList.length < 1) {
    return res.status(200).json({
      message: "필수 이용약관에 동의해 주세요.",
      resultCode: false,
    });
  }

  try {
    const { data: terms, error } = await supabase.from("terms").select("seq").eq("in_used", true).eq("required", true);

    if (error) throw error;

    const requiredTermsIds = terms.map((term) => term.seq);

    const hasAgreedToAllRequiredTerms = requiredTermsIds.every((seq: number) => termsList.includes(seq));

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
  const errorMessages = Object.keys(req.body).reduce(
    (errors: Partial<{ [key in keyof EmpsInterface]: string }>, fieldName: string) => {
      if (requiredField.includes(fieldName)) {
        const patternInfo = validationRules[fieldName as keyof EmpsInterface];
        if (patternInfo) {
          const sanitizedValue = regexValue(
            patternInfo.pattern,
            req.body[fieldName as keyof EmpsInterface]
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
    // return res.status(200).json({
    //   message: errorMessages[keys[0]],
    //   resultCode: false,
    // });
  }

  try {
    const { data: existingId, error: idError } = await supabase.from("emps").select().eq("user_id", user_id);
    const { data: existinghp, error: hpError } = await supabase.from("emps").select().eq("user_hp", user_hp);

    if ((idError && idError.code !== "PGRST116") || (hpError && hpError.code !== "PGRST116")) {
      return res.status(200).json({ message: "데이터 조회 중 에러가 발생하였습니다.", resultCode: false });
    }

    if (existingId || existinghp) {
      let name = "";
      if (existingId) {
        name = "아이디";
      } else if (existinghp) {
        name = "휴대전화 번호";
      }
      return res.status(200).json({ message: `이미 사용 중인 ${name}입니다.`, resultCode: false });
    }

    if (user_email) {
      const { data: existingEmail, error: emailError } = await supabase
        .from("emps")
        .select()
        .eq("user_email", user_email);
      if (emailError && emailError.code !== "PGRST116") {
        return res.status(200).json({ message: "데이터 조회 중 에러가 발생하였습니다.", resultCode: false });
      }

      if (existingEmail) {
        return res.status(200).json({ message: "이미 사용 중인 이메일입니다.", resultCode: false });
      }
    }

    const hashedPassword = await bcrypt.hash(user_pw, 10);

    // 개인 스페이스 생성
    let randomString = generateRandomString();

    const { data: checkSameName, error: checkSameNameError } = await supabase
      .from("space")
      .select()
      .eq("space_name", randomString);

    if (checkSameNameError && checkSameNameError.code !== "PGRST116") {
      return res.status(200).json({ message: "데이터 조회 중 에러가 발생하였습니다.", resultCode: false });
    }

    // 랜덤으로 스페이스명을 생성할 때 동일한 값이 있는지 확인
    if (checkSameName) {
      randomString = `${randomString}_${checkSameName.length}`;
    }

    const emp = {
      UID: uuidv4(),
      user_profile_seq: 0,
      user_id: user_id,
      user_pw: hashedPassword,
      user_name: user_name,
      user_hp: user_hp,
      user_certification: user_certification,
      user_email: user_email ? user_email : null,
      user_birth: user_birth ? user_birth : null,
      user_public: true,
      user_level: 1,
      recent_space: randomString,
      create_date: new Date(),
      terms: termsList,
    };

    const { error: userError } = await supabase.from("emps").insert(emp).single();

    if (userError) {
      return res.status(200).json({
        message: "회원 가입에 실패하였습니다.",
        error: userError,
        resultCode: false,
      });
    }

    const space = {
      UID: uuidv4(),
      space_profile_seq: null,
      space_name: randomString,
      space_manager: emp.UID,
      space_public: emp.user_public,
      space_users: [],
      create_date: new Date(),
    };

    const { error: spaceError } = await supabase.from("space").insert(space).single();

    if (spaceError) {
      await supabase.from("emps").delete().eq("UID", emp.UID);

      return res.status(200).json({
        message: "스페이스 생성에 실패하였습니다.",
        error: spaceError,
        resultCode: false,
      });
    }

    // 스페이스 리스트 생성
    const { error: spaceListError } = await supabase
      .from("spaceList")
      .insert({
        UID: emp.UID,
        space: [space.UID],
      })
      .single();

    if (spaceListError) {
      await supabase.from("emps").delete().eq("UID", emp.UID);
      await supabase.from("space").delete().eq("UID", space.UID);

      return res.status(200).json({
        message: "스페이스 리스트 생성에 실패하였습니다.",
        error: spaceListError,
        resultCode: false,
      });
    }

    if (file) {
      const saveFile = await handleFileUpload(file);

      if (!saveFile) throw saveFile;

      const { error: profileError } = await supabase
        .from("emps")
        .update({ user_profile_seq: saveFile.data?.seq || 0 })
        .eq("UID", emp.UID);

      if (profileError) {
        await supabase.from("emps").delete().eq("UID", emp.UID);
        await supabase.from("space").delete().eq("UID", space.UID);
        await supabase.from("spaceList").delete().eq("UID", emp.UID);

        return res.status(200).json({
          message: "프로필 이미지 저장에 실패하였습니다.",
          error: profileError,
          resultCode: false,
        });
      }
    }
    return res.status(200).json({
      message: "회원 가입이 완료되었습니다.",
      resultCode: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "서버 에러가 발생하였습니다.",
      error: error,
      resultCode: false,
    });
  }
}

function generateRandomString(length = 8) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(randomIndex);
  }

  return result;
}
