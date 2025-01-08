
"use server";
import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import fs from "fs";
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

const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_DATABASE } = process.env;

// 데이터베이스 연결 설정
let dataSource: DataSource | null = null;

/**
 * 데이터베이스 연결 초기화 함수
 * 한 번 초기화되면 이후에는 동일한 연결을 재사용
 */
export const initializeDataSource = async (): Promise<DataSource> => {
  if (!dataSource) {
    try {
      dataSource = new DataSource({
        type: "postgres", // PostgreSQL 사용
        url: NEXT_PUBLIC_SUPABASE_URL,
        password: NEXT_PUBLIC_SUPABASE_ANON_KEY,
        // database: SUPABASE_DATABASE, 
        synchronize: false, // 프로덕션에서는 false로 설정
        logging: false, // 로그를 기록하지 않도록 설정
        schema: "public",
        ssl: {
          ca: fs.readFileSync('./prod-ca-2021.crt'),
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
      await dataSource.initialize(); // 연결 초기화
      console.log("Database connection initialized.");
    } catch (error) {
      console.error("Failed to initialize database connection:", error);
      throw new Error("Database initialization failed.");
    }
  }
  return dataSource;
};

/**
 * 데이터베이스 연결 객체 반환
 * 이미 초기화된 경우 바로 반환
 */
export const getDataSource = async (): Promise<DataSource> => {
  if (!dataSource) {
    try {
      await initializeDataSource();
    } catch (error) {
      console.error("Error while getting data source:", error);
      throw new Error("Unable to get data source.");
    }
  }

  // 데이터베이스 연결이 없으면 예외 처리
  if (!dataSource) {
    throw new Error("DataSource is not initialized.");
  }

  return dataSource;
};

// 서버 종료 시 데이터베이스 연결 종료 처리
const shutdown = async () => {
  if (dataSource?.isInitialized) {
    try {
      await dataSource.destroy();
      console.log("Database connection closed.");
    } catch (error) {
      console.error("Error while closing database connection:", error);
    }
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
