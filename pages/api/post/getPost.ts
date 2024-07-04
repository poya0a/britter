"use server";
import { NextApiResponse } from "next";
import { AppDataSource } from "@database/typeorm.config";
import { Post } from "@/server/entities/Post.entity";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@/server/utils/authenticateToken";

interface PostData extends Post {
  subPost?: PostData[];
}

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }
  authenticateToken(req, res, async () => {
    if (req.user) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;
      try {
        const dataSource = await AppDataSource.useFactory();
        const postRepository = dataSource.getRepository(Post);

        const posts = await postRepository
          .createQueryBuilder("post")
          .where("post.UID = :uid", { uid })
          .orderBy("post.p_seq", "ASC")
          .addOrderBy("post.order_number", "ASC")
          .getMany();

        const groupedPosts: PostData[] = groupPosts(posts);

        return res.status(200).json({
          message: "게시글 목록 조회 완료했습니다.",
          data: groupedPosts,
          resultCode: true,
        });
      } catch (error) {
        return res.status(500).json({
          message:
            typeof error === "string" ? error : "서버 에러가 발생하였습니다.",
          error: error,
          resultCode: false,
        });
      }
    } else {
      return res.status(200).json({
        message: "사용자 정보를 찾을 수 없습니다.",
        resultCode: false,
      });
    }
  });
}

function groupPosts(posts: PostData[]): PostData[] {
  const postMap: { [key: string]: PostData } = {};
  const groupedPosts: PostData[] = [];

  posts.forEach((post) => {
    postMap[post.seq] = { ...post, subPost: [] };
  });

  posts.forEach((post) => {
    if (post.p_seq) {
      const parentPost = postMap[post.p_seq];
      if (parentPost) {
        parentPost.subPost?.push(postMap[post.seq]);
      }
    } else {
      groupedPosts.push(postMap[post.seq]);
    }
  });

  return groupedPosts;
}
