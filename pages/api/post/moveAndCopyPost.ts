"use server";
import { NextApiResponse } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";
import { v4 as uuidv4 } from "uuid";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  authenticateToken(req, res, async () => {
    const form = formidable({});

    form.parse(req, async (err, fields) => {
      if (err) {
        return res.status(200).json({
          message: err,
          resultCode: false,
        });
      }
      if (req.user) {
        // 토큰 이용하여 UID GET
        const uid = req.user.claims.UID;
        try {
          if (uid && fields.spaceUid && fields.type && fields.seq && fields.pSeq) {
            const spaceUid: string = fields.spaceUid[0];
            const type: string = fields.type[0];
            const seq: string = fields.seq[0];
            const pSeq: string = fields.pSeq[0] === "all" ? "" : fields.pSeq[0];

            // 저장하는 스페이스에 권한이 있는지 체크
            const { data: findSpace, error: spaceError } = await supabase
              .from("spaces")
              .select("*")
              .eq("UID", spaceUid)
              .single();

            if (spaceError) {
              return res.status(200).json({
                message: "스페이스 정보를 찾을 수 없습니다. 다시 시도해 주세요.",
                resultCode: false,
              });
            }

            if (findSpace.space_manager === uid || findSpace.space_users.includes(uid)) {
              const { data: currentPost, error: postError } = await supabase
                .from("posts")
                .select("*")
                .eq("seq", seq)
                .eq("space_uid", spaceUid)
                .single();

              if (postError || !currentPost) {
                return res.status(200).json({
                  message: `${type === "move" ? "이동" : "복사"}할 게시글을 찾을 수 없습니다.`,
                  resultCode: false,
                });
              }

              // 이동
              if (type === "move") {
                const currentPSeq = currentPost.p_seq;
                currentPost.p_seq = pSeq;

                // 기존 부모 시퀀스의 게시글 정렬
                if (currentPSeq !== "") {
                  const { data: postsWithSamePSeq, error: postsError } = await supabase
                    .from("posts")
                    .select("*")
                    .eq("p_seq", currentPSeq)
                    .eq("space_uid", spaceUid);

                  if (postsError) {
                    return res.status(200).json({
                      message: "서버 에러가 발생하였습니다.",
                      resultCode: false,
                    });
                  }

                  const postsToSort = postsWithSamePSeq.filter((post) => post.order_number);

                  postsToSort.sort((a, b) => a.order_number - b.order_number);

                  for (let i = 0; i < postsToSort.length; i++) {
                    postsToSort[i].order_number = i + 1;
                    await supabase.from("posts").upsert(postsToSort[i]);
                  }
                }

                // 새 부모 시퀀스에서 마지막 순번으로 업데이트
                const { data: newParentPosts, error: parentPostsError } = await supabase
                  .from("posts")
                  .select("*")
                  .eq("p_seq", pSeq);

                if (parentPostsError) {
                  return res.status(200).json({
                    message: "서버 에러가 발생하였습니다.",
                    resultCode: false,
                  });
                }

                const maxOrderNumber = Math.max(...newParentPosts.map((post) => post.order_number || 0), 0) + 1;
                currentPost.order_number = maxOrderNumber;

                await supabase.from("posts").upsert(currentPost);

                return res.status(200).json({
                  message: "게시글이 이동되었습니다.",
                  data: { seq: seq },
                  resultCode: true,
                });
              } else {
                const copiedPost = await copyPostAndChildren(currentPost, pSeq, spaceUid);

                return res.status(200).json({
                  message: "게시글이 복사되었습니다.",
                  data: { seq: copiedPost.seq },
                  resultCode: true,
                });
              }
            } else {
              return res.status(200).json({
                message: "게시글 작성 권한이 없습니다.",
                resultCode: false,
              });
            }
          } else {
            return res.status(200).json({
              message: "게시글 정보가 올바르지 않습니다.",
              resultCode: false,
            });
          }
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
  });
}

// 게시글과 자식 게시글을 재귀적으로 복사하는 함수
async function copyPostAndChildren(
  parentPost: any,
  newPSeq: string, // 새로운 부모 시퀀스
  spaceUid: string
): Promise<any> {
  const copiedPost = { ...parentPost };
  const newSeq = uuidv4(); // 새 시퀀스 생성

  copiedPost.seq = newSeq; // 새 시퀀스
  copiedPost.p_seq = newPSeq; // 부모 시퀀스 업데이트
  copiedPost.space_uid = spaceUid; // 동일한 스페이스 UID
  copiedPost.order_number = await getNextOrderNumber(newPSeq); // 새 순서

  // Save copied post
  await supabase.from("posts").upsert(copiedPost);

  // Copy child posts recursively
  const { data: childPosts, error: childPostsError } = await supabase
    .from("posts")
    .select("*")
    .eq("p_seq", parentPost.seq)
    .eq("space_uid", spaceUid);

  if (childPostsError) {
    throw new Error("Error fetching child posts");
  }

  for (const childPost of childPosts) {
    await copyPostAndChildren(childPost, newSeq, spaceUid);
  }

  return copiedPost;
}

// 새로운 부모 시퀀스에서 다음 순서를 가져오는 함수
async function getNextOrderNumber(pSeq: string): Promise<number> {
  const { data: posts, error: postsError } = await supabase.from("posts").select("*").eq("p_seq", pSeq);

  if (postsError) {
    throw new Error("Error fetching posts");
  }

  const maxOrderNumber = Math.max(...posts.map((post) => post.order_number || 0), 0);

  return maxOrderNumber + 1;
}
