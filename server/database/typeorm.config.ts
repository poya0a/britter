
"use server";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { File } from "@entities/File.entity";
import { Tag } from "@entities/Tag.entity";
import { Terms } from "@entities/Terms.entity";
import { Space } from "@entities/Space.entity";
import { SpaceList } from "@entities/SpaceList.entity";
import { Certification } from "@entities/Certification.entity";
import { Private } from "@entities/Private.entity";
import { Emps } from "@entities/Emps.entity";
import { Post } from "@entities/Post.entity";
import { Comment } from "@entities/Comment.entity";
import { Notifications } from "@entities/Notifications.entity";
import { Message } from "@entities/Message.entity";

config();

const { DATABASE_URL, DIRECT_URL } = process.env;

const sslDirectory = path.join(process.cwd(), 'prod-ca-2021.crt');

// 데이터베이스 연결 설정
let dataSource: DataSource | null = null; // 초기화된 dataSource를 저장할 변수

/**
 * 데이터베이스 연결 객체 반환
 * 이미 초기화된 경우 바로 반환
 */
export const getDataSource = async (): Promise<DataSource> => {
  if (!dataSource) {
    // dataSource가 없으면 처음 한 번만 초기화
    try {
      dataSource = new DataSource({
        type: "postgres", // PostgreSQL 사용
        // database: DATABASE_URL,
        url: DIRECT_URL,
        synchronize: false, // 프로덕션에서는 false로 설정
        logging: false, // 로그를 기록하지 않도록 설정
        schema: "public",
        ssl: {
          ca: fs.readFileSync(sslDirectory), // SSL 인증서
        },
        entities: [
          File,
          Tag,
          Terms,
          Space,
          SpaceList,
          Certification,
          Private,
          Emps,
          Post,
          Comment,
          Notifications,
          Message,
        ], // 엔터티들
        migrations: [],
        subscribers: [],
      });
      
      await dataSource.initialize(); // 데이터베이스 연결 초기화
      console.log("Database connection initialized.");
    } catch (error) {
      console.error("Failed to initialize database connection:", error);
      throw new Error("Database initialization failed.");
    }
  }

  return dataSource; // 초기화된 연결을 반환
};
