"use server";
import { NextApiResponse, NextApiRequest } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";
import { extractImgDataSeq } from "@/server/utils/extractImgDataSeq";
import { handleFileDelete } from "@/server/utils/fileDelete";

export default async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  const { spaceUid } = JSON.parse(req.body);

  authenticateToken(req, res, async () => {
    if (req.user) {
      const uid = req.user.claims.UID;

      try {
        const { data: space, error: spaceError } = await supabase
          .from("spaces")
          .select("*")
          .eq("UID", spaceUid)
          .eq("space_manager", uid)
          .single();

        if (spaceError || !space) {
          return res.status(200).json({
            message: "삭제할 스페이스를 찾을 수 없습니다.",
            resultCode: false,
          });
        }

        const { data: spaceList, error: spaceListError } = await supabase
          .from("space_lists")
          .select("space")
          .eq("UID", uid)
          .single();

        if (spaceListError || !spaceList) {
          return res.status(200).json({
            message: "사용자의 스페이스 리스트를 찾을 수 없습니다.",
            resultCode: false,
          });
        }

        if (spaceList.space.length <= 1) {
          return res.status(200).json({
            message: "최소한 하나의 스페이스를 가지고 있어야 합니다.",
            resultCode: false,
          });
        }

        const updatedSpaceList = spaceList.space.filter((spaceId: string) => spaceId !== spaceUid);

        await supabase.from("space_lists").update({ space: updatedSpaceList }).eq("UID", uid);

        const { data: spaceUsers, error: spaceUsersError } = await supabase
          .from("spaces")
          .select("space_users")
          .eq("UID", spaceUid)
          .single();

        if (spaceUsersError || !spaceUsers) {
          return res.status(200).json({
            message: "스페이스 사용자 정보를 찾을 수 없습니다.",
            resultCode: false,
          });
        }

        for (const userUid of spaceUsers.space_users || []) {
          const { data: userSpaceList, error: userSpaceListError } = await supabase
            .from("space_lists")
            .select("space")
            .eq("UID", userUid)
            .single();

          if (userSpaceListError || !userSpaceList) continue;

          const updatedUserSpaceList = userSpaceList.space.filter((spaceId: string) => spaceId !== spaceUid);

          await supabase.from("space_lists").update({ space: updatedUserSpaceList }).eq("UID", userUid);
        }

        const { data: posts, error: postsError } = await supabase.from("posts").select("*").eq("space_uid", spaceUid);

        if (postsError) {
          return res.status(200).json({
            message: "게시글을 찾을 수 없습니다.",
            resultCode: false,
          });
        }

        if (posts && posts.length > 0) {
          for (const post of posts) {
            const extractedSeqList = extractImgDataSeq(post.content);

            if (extractedSeqList.length > 0) {
              for (const seq of extractedSeqList) {
                await handleFileDelete(seq);
              }
            }

            await supabase.from("posts").delete().eq("seq", post.seq);
          }
        }

        await supabase.from("spaces").delete().eq("UID", spaceUid);

        return res.status(200).json({
          message: "스페이스가 성공적으로 삭제되었습니다.",
          resultCode: true,
        });
      } catch (error) {
        return res.status(200).json({
          message: typeof error === "string" ? error : "서버 에러가 발생하였습니다.",
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
