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

  const { user_id, user_pw, user_name, user_email } = req.body;

  if (!user_id || !user_pw || !user_name || !user_email) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const dataSource = await AppDataSource.useFactory();
    const userRepository = dataSource.getRepository(Emps);
    const existingUser = await userRepository.findOne({ where: { user_id } });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(user_pw, 10);

    const newUser = userRepository.create({
      user_id,
      user_pw: hashedPassword,
      user_name,
      user_email,
    });
    await userRepository.save(newUser);

    const token = jwt.sign(
      { user_id: newUser.user_id },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      }
    );
    return res
      .status(201)
      .json({ message: "User registered successfully", token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error });
  }
}
