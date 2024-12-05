import { NextApiRequest, NextApiResponse } from "next";
import { getDataSource } from "@database/typeorm.config";
import { Private } from "@entities/Private.entity";
import { generateKeyPair } from "@server/utils/crytoService";
import generateDeviceUUID from "@server/utils/generateDeviceUUID";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ message: "잘못된 메소드입니다.", resultCode: false });
  }
  const deviceId = generateDeviceUUID({
    userAgent: req.headers["user-agent"],
  });

  if (!deviceId) {
    return res.status(200).json({
      message: "디바이스 아이디가 존재하지 않습니다.",
      resultCode: false,
    });
  }

  try {
    const dataSource = await getDataSource();
    const privateRepository = dataSource.getRepository(Private);
    const { publicKey, privateKey } = generateKeyPair(deviceId);
    if (publicKey && privateKey) {
      const existingPrivate = await privateRepository.findOne({
        where: { device_id: deviceId },
      });
      if (!existingPrivate) {
        const newPrivateKeyEntry = new Private();
        newPrivateKeyEntry.device_id = deviceId;
        newPrivateKeyEntry.private_key = privateKey;
        await privateRepository.save(newPrivateKeyEntry);
      } else {
        existingPrivate.private_key = privateKey;
        await privateRepository.save(existingPrivate);
      }

      return res.status(200).json({ message: publicKey, resultCode: true });
    } else {
      return res
        .status(200)
        .json({ message: "키 생성을 실패하였습니다.", resultCode: false });
    }
  } catch (error: any) {
    return res.status(500).json({
      message: "서버 에러가 발생하였습니다.",
      error: error.toString(),
      resultCode: false,
    });
  }
}
