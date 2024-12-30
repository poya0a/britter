"use server";
import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
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

const { DB_HOST, DB_USER, DB_PASSWORD, DB_SCHEMA } = process.env;

// 데이터베이스 연결 설정
const dataSource = new DataSource({
  type: "mysql",
  host: DB_HOST,
  port: 3306,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_SCHEMA,
  synchronize: false,
  logging: false,
  entities: [File, Tag, Terms, Space, SpaceList, Certification, Private, Emps, Post, Comment, Notifications, Message],
  migrations: [],
  subscribers: [],
  connectTimeout: 360,
  extra: {
    connectionLimit: 10, // 커넥션 풀 제한 설정
  },
});

// 전역 변수로 데이터베이스 연결 상태 관리
let isInitialized = false;

/**
 * 데이터베이스 연결 초기화 함수
 * 한 번 초기화되면 이후에는 동일한 연결을 재사용
 */
export const initializeDataSource = async (): Promise<DataSource> => {
  if (!isInitialized) {
    try {
      await dataSource.initialize();
      isInitialized = true;
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
  if (!isInitialized) {
    await initializeDataSource();
  }
  return dataSource;
};

const shutdown = async () => {
  if (dataSource.isInitialized) {
    await dataSource.destroy();
    console.log("Database connection closed.");
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
