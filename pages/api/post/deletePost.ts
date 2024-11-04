"use server";
import { NextApiRequest, NextApiResponse } from "next";
import { getDataSource } from "@database/typeorm.config";
import { Post } from "@entities/Post.entity";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@/server/utils/authenticateToken";
import { extractImgDataSeq } from "@/server/utils/extractImgDataSeq";
import { handleFileDelete } from "@/server/utils/fileDelete";
import { Repository } from "typeorm";

export default async function handler(
  req: AuthenticatedRequest & NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  const { seq } = JSON.parse(req.body);

  authenticateToken(req, res, async () => {
    if (req.user) {
      // 토큰 이용하여 UID GET
      const uid = req.user.claims.UID;
      try {
        const dataSource = await getDataSource();
        const postRepository = dataSource.getRepository(Post);

        if (!seq) {
          return res.status(200).json({
            message: "게시글 정보가 올바르지 않습니다.",
            resultCode: false,
          });
        }

        const currentPost = await postRepository.findOne({
          where: { seq, UID: uid },
        });

        // const childPosts = await postRepository.find({
        //   where: { p_seq: seq, UID: uid },
        // });

        if (!currentPost) {
          return res.status(200).json({
            message: "삭제할 게시글을 찾을 수 없습니다.",
            resultCode: false,
          });
        }

        // 삭제한 파일 seq 배열
        let dataSeqList: number[] = [];

        // if (childPosts.length > 0) {
        //   // 게시글에 포함된 파일 데이터 seq 배열
        //   for (const post of childPosts) {
        //     const extractedSeqList = extractImgDataSeq(post.content);
        //     dataSeqList = dataSeqList.concat(extractedSeqList);
        //   }
        // }

        // 게시글에 포함된 파일 데이터와 물리 파일 삭제
        // const extractedSeqList = extractImgDataSeq(currentPost.content);
        // dataSeqList = dataSeqList.concat(extractedSeqList);
        await deletePostAndChildren(seq, postRepository, uid, dataSeqList);

        if (dataSeqList.length > 0) {
          for (const seq of dataSeqList) {
            await handleFileDelete(seq);
          }
        }

        let pSeq: string = currentPost?.p_seq || "";

        // // 게시글 데이터 삭제
        // await postRepository.remove(childPosts);
        // await postRepository.remove(currentPost);

        // 남은 게시글 재정렬
        const postsWithSamePSeq = await postRepository.find({
          where: { p_seq: pSeq, UID: uid },
        });

        const postsToSort = postsWithSamePSeq.filter(
          (post) => post.order_number
        );

        postsToSort.sort((a, b) => a.order_number - b.order_number);

        for (let i = 0; i < postsToSort.length; i++) {
          postsToSort[i].order_number = i + 1;
          await postRepository.save(postsToSort[i]);
        }

        return res.status(200).json({
          message: "게시글이 삭제되었습니다.",
          data: { seq: pSeq },
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

async function deletePostAndChildren(
  postSeq: string,
  postRepository: Repository<Post>,
  uid: string,
  dataSeqList: number[]
) {
  const childPosts = await postRepository.find({
    where: { p_seq: postSeq, UID: uid },
  });

  const currentPost = await postRepository.findOne({
    where: { seq: postSeq, UID: uid },
  });

  if (currentPost) {
    const extractedSeqList = extractImgDataSeq(currentPost.content);
    dataSeqList.push(...extractedSeqList);
    await postRepository.remove(currentPost);
  }

  for (const childPost of childPosts) {
    await deletePostAndChildren(
      childPost.seq,
      postRepository,
      uid,
      dataSeqList
    );
  }
}
