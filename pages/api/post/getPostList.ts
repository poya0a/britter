"use server";
import { NextApiRequest, NextApiResponse } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";

interface PostData {
  seq: string;
  p_seq?: string;
  title: string;
  subPost?: PostData[];
}

export default async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  const { postUid } = JSON.parse(req.body);

  authenticateToken(req, res, async () => {
    if (req.user) {
      try {
        const { data: posts, error } = await supabase
          .from("post")
          .select("seq, p_seq, title")
          .eq("space_uid", postUid)
          .order("p_seq", { ascending: true })
          .order("order_number", { ascending: true });

        if (error) {
          if (error.code === "PGRST116") {
            return res.status(200).json({
              message: "게시글 목록 조회 완료했습니다.",
              data: [],
              resultCode: true,
            });
          }
          throw error;
        }

        const groupedPosts = groupPosts(posts);

        return res.status(200).json({
          message: "게시글 목록 조회 완료했습니다.",
          data: groupedPosts,
          resultCode: true,
        });
      } catch (error) {
        return res.status(500).json({
          message: "서버 에러가 발생하였습니다.",
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
