import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "@/server/database/typeorm.config";
import { Emps } from "@entities/Emps.entity";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { user_id, user_pw } = req.body;

  if (!user_id || !user_pw) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const dataSource = await AppDataSource.useFactory();
    const userRepository = dataSource.getRepository(Emps);
    const user = await userRepository.findOne({ where: { user_id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(user_pw, user.user_pw);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error });
  }
}
