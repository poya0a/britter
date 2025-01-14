import { NextApiRequest, NextApiResponse } from "next";
import supabase from "@database/supabase.config";
import { generateKeyPair } from "@server/utils/crytoService";
import generateDeviceUUID from "@server/utils/generateDeviceUUID";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "잘못된 메소드입니다.", resultCode: false });
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
    const { publicKey, privateKey } = generateKeyPair(deviceId);
    if (publicKey && privateKey) {
      const { data: existingPrivate, error } = await supabase
        .from("private")
        .select("device_id, private_key")
        .eq("device_id", deviceId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!existingPrivate) {
        const { error: insertError } = await supabase.from("private").insert([
          {
            device_id: deviceId,
            private_key: privateKey,
          },
        ]);
        if (insertError) {
          throw insertError;
        }
      } else {
        const { error: updateError } = await supabase
          .from("private")
          .update({ private_key: privateKey })
          .eq("device_id", deviceId);
        if (updateError) {
          throw updateError;
        }
      }

      return res.status(200).json({ message: publicKey, resultCode: true });
    } else {
      return res.status(200).json({ message: "키 생성을 실패하였습니다.", resultCode: false });
    }
  } catch (error) {
    return res.status(200).json({
      message: "서버 에러가 발생하였습니다.",
      error: error,
      resultCode: false,
    });
  }
}
