"use server";
import { NextApiRequest, NextApiResponse } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";
import { extractImgDataSeq } from "@server/utils/extractImgDataSeq";
import { handleFileDelete } from "@server/utils/fileDelete";

export default async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  const { seq } = JSON.parse(req.body);

  authenticateToken(req, res, async () => {
    if (req.user) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;
      try {
        if (!seq) {
          return res.status(200).json({
            message: "게시글 정보가 올바르지 않습니다.",
            resultCode: false,
          });
        }

        // 게시글 조회
        const { data: currentPost, error: postError } = await supabase
          .from("posts")
          .select("*")
          .eq("seq", seq)
          .eq("UID", uid)
          .single();

        if (postError) {
          if (postError.code === "PGRST116") {
            return res.status(200).json({
              message: "삭제할 게시글을 찾을 수 없습니다.",
              resultCode: false,
            });
          }
          throw postError;
        }

        // 삭제한 파일 seq 배열
        let dataSeqList: number[] = [];

        await deletePostAndChildren(seq, uid, dataSeqList);

        if (dataSeqList.length > 0) {
          for (const seq of dataSeqList) {
            await handleFileDelete(seq);
          }
        }

        const pSeq: string = currentPost?.p_seq || "";

        // 남은 게시글 재정렬
        const { data: postsWithSamePSeq, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .eq("p_seq", pSeq)
          .eq("UID", uid);

        if (postsError) throw postsError;

        const postsToSort = postsWithSamePSeq.filter((post) => post.order_number);

        postsToSort.sort((a, b) => a.order_number - b.order_number);

        for (let i = 0; i < postsToSort.length; i++) {
          postsToSort[i].order_number = i + 1;
          await supabase
            .from("posts")
            .update({ order_number: postsToSort[i].order_number })
            .eq("seq", postsToSort[i].seq);
        }

        return res.status(200).json({
          message: "게시글이 삭제되었습니다.",
          data: { seq: pSeq },
          resultCode: true,
        });
      } catch (error) {
        return res.status(200).json({
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

async function deletePostAndChildren(postSeq: string, uid: string, dataSeqList: number[]) {
  // 자식 게시글 조회
  const { data: childPosts, error: childPostsError } = await supabase
    .from("posts")
    .select("*")
    .eq("p_seq", postSeq)
    .eq("UID", uid);

  if (childPostsError) {
    throw new Error(childPostsError.message);
  }

  // 현재 게시글 삭제
  const { data: currentPost, error: currentPostError } = await supabase
    .from("posts")
    .select("*")
    .eq("seq", postSeq)
    .eq("UID", uid)
    .single();

  if (currentPostError) {
    throw new Error(currentPostError.message);
  }

  if (currentPost) {
    const extractedSeqList = extractImgDataSeq(currentPost.content);
    dataSeqList.push(...extractedSeqList);

    // 게시글 삭제
    const { error: deleteError } = await supabase.from("posts").delete().eq("seq", postSeq).eq("UID", uid);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }

  // 자식 게시글에 대해 재귀적으로 삭제
  for (const childPost of childPosts) {
    await deletePostAndChildren(childPost.seq, uid, dataSeqList);
  }
}
