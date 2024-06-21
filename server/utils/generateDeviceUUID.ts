import crypto from "crypto";

const generateDeviceUUID = (clientInfo: { userAgent: string | undefined }) => {
  const userAgent = clientInfo.userAgent || "";

  const hash = crypto.createHash("sha256");
  hash.update(userAgent);

  return hash.digest("hex");
};
export default generateDeviceUUID;
