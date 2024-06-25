import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { AppDataSource } from "@database/typeorm.config";
import { Emps } from "@entities/Emps.entity";
import { Private } from "@entities/Private.entity";
import generateDeviceUUID from "@/server/utils/generateDeviceUUID";
import {
  createAccessToken,
  createRefreshToken,
} from "@/server/provider/jwtProvider";
import { decryptData } from "@/server/utils/crytoService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "잘못된 메소드입니다.", resultCode: false });
  }

  const { user_id, user_pw } = req.body;
  const deviceId = generateDeviceUUID({
    userAgent: req.headers["user-agent"],
  });

  if (!user_id || !user_pw) {
    const name = !user_id ? "아이디" : "비밀번호";
    return res
      .status(200)
      .json({ message: `${name}를 입력해 주세요.`, resultCode: false });
  }

  try {
    const dataSource = await AppDataSource.useFactory();
    const privateRepository = dataSource.getRepository(Private);
    const existingPrivate = await privateRepository.findOne({
      where: { device_id: deviceId },
    });

    if (!existingPrivate) {
      return res.status(200).json({
        message: "디바이스에 해당하는 개인 키가 없습니다.",
        resultCode: false,
      });
    }

    const decryptedUserId = decryptData(user_id, existingPrivate.private_key);
    const decryptedUserPw = decryptData(user_pw, existingPrivate.private_key);

    const userRepository = dataSource.getRepository(Emps);

    const user = await userRepository.findOne({
      where: { user_id: decryptedUserId.split('"').join("") },
    });

    if (!user) {
      return res.status(200).json({
        message: "아이디 혹은 비밀번호를 확인해 주세요.",
        resultCode: false,
      });
    }

    const isPasswordValid = await bcrypt.compare(
      decryptedUserPw.split('"').join(""),
      user.user_pw
    );

    if (!isPasswordValid) {
      return res.status(200).json({
        message: "아이디 혹은 비밀번호를 확인해 주세요.",
        resultCode: false,
      });
    }

    const accessToken = createAccessToken({
      UID: user.UID,
      user_id: user.user_id,
    });
    const refreshToken = createRefreshToken({
      UID: user.UID,
      user_id: user.user_id,
    });

    user.private_seq = existingPrivate.seq;

    await userRepository.save(user);

    return res
      .status(200)
      .json({ resultCode: true, accessToken, refreshToken });
  } catch (error) {
    return res.status(500).json({
      message: "서버 에러가 발생하였습니다.",
      error: error,
      resultCode: false,
    });
  }
}
