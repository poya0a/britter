
"use server";
import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
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

dotenv.config();

const { POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, SUPABASE_SERVICE_ROLE_KEY } = process.env;

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
        database: POSTGRES_PRISMA_URL,
        url: POSTGRES_URL_NON_POOLING,
        password: SUPABASE_SERVICE_ROLE_KEY,
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
        extra: {
          // 서버리스 환경에서는 connection pooling을 사용하지 않도록 설정
          max: 1, // 최대 연결 수 1개로 설정
          connectionTimeoutMillis: 30000, // 연결 타임아웃 설정
        },
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

// // 서버 종료 시 데이터베이스 연결 종료 처리
// const shutdown = async () => {
//   if (dataSource?.isInitialized) {
//     try {
//       await dataSource.destroy(); // 데이터베이스 연결 종료
//       console.log("Database connection closed.");
//     } catch (error) {
//       console.error("Error while closing database connection:", error);
//     }
//   }
// };

// // SIGINT (Ctrl + C) 및 SIGTERM (종료 시그널) 이벤트 핸들러 등록
// process.on("SIGINT", shutdown);
// process.on("SIGTERM", shutdown);
