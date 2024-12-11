"use server";
import { NextApiRequest, NextApiResponse } from "next";
import { getDataSource } from "@database/typeorm.config";
import { Post } from "@entities/Post.entity";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@server/utils/authenticateToken";
import { v4 as uuidv4 } from "uuid";
import formidable from "formidable";
import { Space } from "@entities/Space.entity";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다." });
  }

  authenticateToken(req, res, async () => {
    const form = formidable({});

    form.parse(req, async (err, fields) => {
      if (err) {
        return res.status(500).json({
          message: err,
          resultCode: false,
        });
      }
      if (req.user) {
        // 토큰 이용하여 UID GET
        const uid = req.user.claims.UID;
        try {
          const dataSource = await getDataSource();
          const postRepository = dataSource.getRepository(Post);

          if (
            uid &&
            fields.spaceUid &&
            fields.type &&
            fields.seq &&
            fields.pSeq
          ) {
            const spaceUid: string = fields.spaceUid[0];
            const type: string = fields.type[0];
            const seq: string = fields.seq[0];
            const pSeq: string = fields.pSeq[0] === "all" ? "" : fields.pSeq[0];

            // 저장하는 스페이스에 권한이 있는지 체크
            const spaceRepository = dataSource.getRepository(Space);

            const findSpace = await spaceRepository.findOne({
              where: { UID: spaceUid },
            });
            if (findSpace) {
              if (
                findSpace.space_manager === uid ||
                findSpace.space_users.includes(uid)
              ) {
                const currentPost = await postRepository.findOne({
                  where: { seq: seq, space_uid: spaceUid },
                });

                if (!currentPost) {
                  return res.status(200).json({
                    message: `${
                      type === "move" ? "이동" : "복사"
                    }할 게시글을 찾을 수 없습니다.`,
                    resultCode: false,
                  });
                }

                // 이동
                if (type === "move") {
                  const currentPSeq = currentPost.p_seq;
                  currentPost.p_seq = pSeq;

                  // 기존 부모 시퀀스의 게시글 정렬
                  if (currentPSeq !== "") {
                    const postsWithSamePSeq = await postRepository.find({
                      where: { p_seq: currentPSeq, space_uid: spaceUid },
                    });

                    const postsToSort = postsWithSamePSeq.filter(
                      (post) => post.order_number
                    );

                    postsToSort.sort((a, b) => a.order_number - b.order_number);

                    for (let i = 0; i < postsToSort.length; i++) {
                      postsToSort[i].order_number = i + 1;
                      await postRepository.save(postsToSort[i]);
                    }
                  }

                  // 새 부모 시퀀스에서 마지막 순번으로 업데이트
                  const newParentPosts = await postRepository.find({
                    where: { p_seq: pSeq },
                  });
                  const maxOrderNumber =
                    Math.max(
                      ...newParentPosts.map((post) => post.order_number),
                      0
                    ) + 1;
                  currentPost.order_number = maxOrderNumber;
                  await postRepository.save(currentPost);

                  return res.status(200).json({
                    message: "게시글이 이동되었습니다.",
                    data: { seq: seq },
                    resultCode: true,
                  });
                } else {
                  const copiedPost = { ...currentPost };
                  const uuid = uuidv4();

                  copiedPost.seq = uuid;
                  copiedPost.p_seq = pSeq;

                  const parentPosts = await postRepository.find({
                    where: { p_seq: pSeq },
                  });
                  copiedPost.order_number =
                    Math.max(
                      ...parentPosts.map((post) => post.order_number),
                      0
                    ) + 1;

                  await postRepository.save(copiedPost);

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
                message:
                  "스페이스 정보를 찾을 수 없습니다. 다시 시도해 주세요.",
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
  });
}

// const handleCopy = async (
//   currentPost: Post,
//   pSeq: string,
//   postRepository: Repository<Post>
// ) => {
//   const uuid = uuidv4();

//   // 새로운 게시글을 생성
//   const newPost = postRepository.create({
//     ...currentPost,
//     p_seq: pSeq, // 새로운 부모 시퀀스
//     seq: uuid, // 새로 생성된 고유 시퀀스
//     order_number: null, // 순서가 아직 정해지지 않음
//   });

//   await postRepository.save(newPost);

//   // 동일한 pSeq를 가진 게시글들 가져오기
//   const postsWithSamePSeq = await postRepository.find({
//     where: { p_seq: pSeq, UID: currentPost.UID },
//   });

//   // order_number가 정의된 게시글들만 필터링하여 정렬
//   const postsToSort = postsWithSamePSeq.filter(
//     (post) => post.order_number !== undefined
//   );

//   // 만약 게시글이 있다면, 가장 큰 order_number를 구하고 그 다음 번호를 새 게시글의 order_number로 설정
//   let newOrderNumber = 1; // 기본적으로 첫 번째 순서

//   if (postsToSort.length > 0) {
//     const maxOrderNumber = Math.max(
//       ...postsToSort.map((post) => post.order_number)
//     );
//     newOrderNumber = maxOrderNumber + 1;
//   }

//   // 새 게시글의 순서를 설정
//   newPost.order_number = newOrderNumber;
//   await postRepository.save(newPost);

//   // 순서를 재정렬
//   postsToSort.push(newPost); // 새로운 게시글을 포함하여 순서를 재조정
//   postsToSort.sort((a, b) => a.order_number - b.order_number);

//   // 정렬된 게시글들의 order_number 업데이트
//   for (let i = 0; i < postsToSort.length; i++) {
//     postsToSort[i].order_number = i + 1; // 순서를 1부터 차례대로 재설정
//     await postRepository.save(postsToSort[i]);
//   }

//   return uuid; // 새 게시글의 seq를 반환
// };
