"use server";
import crypto from "crypto";

const DEFAULT_KEY_SIZE: number = 2048;

export function generateKeyPair(deviceId: string): {
  publicKey: string;
  privateKey: string;
} {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: DEFAULT_KEY_SIZE,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  return {
    publicKey: Buffer.from(publicKey, "utf8").toString("base64"),
    privateKey: Buffer.from(privateKey, "utf8").toString("base64"),
  };
}

export function encryptData(data: string, publicKey: string): string {
  const bufferPublicKey = Buffer.from(publicKey, "base64");

  const encryptedBuffer = crypto.publicEncrypt(
    {
      key: bufferPublicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    Buffer.from(data)
  );

  return encryptedBuffer.toString("base64");
}

export function decryptData(encryptedData: string, privateKey: string): string {
  try {
    const bufferPrivateKey = Buffer.from(privateKey, "base64");

    const decryptedBuffer = crypto.privateDecrypt(
      {
        key: bufferPrivateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(encryptedData, "base64")
    );

    return decryptedBuffer.toString("utf8");
  } catch (error) {
    throw error;
  }
}
