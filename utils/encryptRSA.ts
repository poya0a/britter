import crypto from "crypto";

export default function encryptRSA(
  publicKey: string,
  data: string
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    try {
      const encrypted = crypto
        .publicEncrypt(
          {
            key: Buffer.from(publicKey, "base64"),
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          },
          Buffer.from(JSON.stringify(data), "utf8")
        )
        .toString("base64");
      resolve(encrypted);
    } catch (error) {
      reject(error);
    }
  });
}
