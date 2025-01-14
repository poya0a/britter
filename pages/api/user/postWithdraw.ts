"use server";
import { NextApiResponse, NextApiRequest } from "next";
import supabase from "@database/supabase.config";
import { AuthenticatedRequest, authenticateToken } from "@server/utils/authenticateToken";
import bcrypt from "bcrypt";
import { handleFileDelete } from "@server/utils/fileDelete";
import { extractImgDataSeq } from "@/server/utils/extractImgDataSeq";

// 비밀번호 일치 여부 확인
async function checkPassword(userWithdrawPw: string, userPwHash: string): Promise<boolean> {
  return await bcrypt.compare(userWithdrawPw, userPwHash);
}

// 스페이스 사용자 제거
async function removeUserFromSpace(spaceUID: string, uid: string) {
  const { data: space, error: spaceError } = await supabase
    .from("space")
    .select("space_users")
    .eq("UID", spaceUID)
    .single();

  if (spaceError || !space) return;

  if (space.space_users.includes(uid)) {
    const updatedUsers = space.space_users.filter((user: string) => user !== uid);

    await supabase.from("space").update({ space_users: updatedUsers }).eq("UID", spaceUID);
  }
}

// 매니저일 경우 스페이스 및 게시글 삭제
async function deleteSpaceAndUsers(spaceUID: string, uid: string) {
  const { data: space, error: spaceError } = await supabase
    .from("space")
    .select("space_manager, space_profile_seq")
    .eq("UID", spaceUID)
    .single();

  if (spaceError || !space) return;

  // 매니저인 경우 스페이스 삭제
  if (space.space_manager === uid) {
    // 스페이스 프로필 있는 경우 데이터 및 물리 파일 삭제
    if (space.space_profile_seq) {
      await handleFileDelete(space.space_profile_seq);
    }

    // 게시글 목록 삭제
    const { data: posts, error: postError } = await supabase
      .from("post")
      .select("UID, content")
      .eq("space_uid", spaceUID);

    if (postError || !posts) return;

    for (const post of posts) {
      const extractedSeqList = extractImgDataSeq(post.content);
      // 게시글에 이미지 파일이 있는 경우 반복문으로 데이터 및 물리 파일 삭제
      if (extractedSeqList.length > 0) {
        for (const seq of extractedSeqList) {
          await handleFileDelete(seq);
        }
      }
      // 게시글 삭제
      await supabase.from("post").delete().eq("UID", post.UID);
    }

    // 사용자 목록 업데이트
    const { data: userSpaceList, error: userSpaceListError } = await supabase
      .from("spaceList")
      .select("space")
      .eq("UID", uid)
      .single();

    if (userSpaceListError || !userSpaceList) return;

    const updatedSpaceList = userSpaceList.space.filter((spaceItem: string) => spaceItem !== spaceUID);

    await supabase.from("space").update({ space: updatedSpaceList }).eq("UID", uid);

    // 스페이스 삭제
    await supabase.from("space").delete().eq("UID", spaceUID);
  }
}

// 엔티티 삭제 로직
async function deleteEntities(uid: string, findUser: any) {
  // 프로필 이미지 삭제
  if (findUser.user_profile_seq !== 0) {
    await handleFileDelete(findUser.user_profile_seq);
  }

  // 휴대폰 인증 정보 삭제
  if (findUser.user_certification) {
    const certificationSeq = findUser.user_certification;
    findUser.user_certification = null;
    await supabase.from("emps").update({ user_certification: null }).eq("UID", uid);
    await supabase.from("certification").delete().eq("seq", certificationSeq);
  }

  // 수신한 메시지 목록 삭제
  await supabase.from("message").delete().eq("recipient_uid", uid);

  // 프라이빗 키 정보 삭제
  if (findUser.private_seq) {
    const privateSeq = findUser.private_seq;
    findUser.private_seq = null;
    await supabase.from("emps").update({ private_seq: null }).eq("UID", uid);
    await supabase.from("private").delete().eq("seq", privateSeq);
  }

  // 스페이스 목록에서 각 스페이스 정보 삭제
  const { data: findSpaceList, error: findSpaceListError } = await supabase
    .from("spaceList")
    .select("space")
    .eq("UID", uid)
    .single();

  if (findSpaceListError || !findSpaceList) return;

  for (const spaceUID of findSpaceList.space) {
    await removeUserFromSpace(spaceUID, uid);
    await deleteSpaceAndUsers(spaceUID, uid);
  }
}

// API 핸들러
export default async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "잘못된 메소드입니다.", resultCode: false });
  }
  const { userWithdrawPw } = JSON.parse(req.body);

  authenticateToken(req, res, async () => {
    if (req.user) {
      const uid = req.user.claims.UID;

      if (!userWithdrawPw) {
        return res.status(200).json({
          message: "회원 탈퇴를 위해 비밀번호를 입력해 주세요.",
          resultCode: false,
        });
      }

      try {
        const { data: findUser, error: findUserError } = await supabase
          .from("emps")
          .select("*")
          .eq("UID", uid)
          .single();

        if (findUserError || !findUser) {
          return res.status(200).json({
            message: "사용자 정보를 찾을 수 없습니다.",
            resultCode: false,
          });
        }

        const isPasswordValid = await checkPassword(userWithdrawPw, findUser.user_pw);

        if (!isPasswordValid) {
          return res.status(200).json({
            message: "비밀번호가 일치하지 않습니다.",
            resultCode: false,
          });
        }

        // 엔티티 삭제 처리
        await deleteEntities(uid, findUser);

        // 최종적으로 사용자 정보 삭제
        await supabase.from("emps").delete().eq("UID", uid);

        return res.status(200).json({ message: "회원 탈퇴가 완료되었습니다.", resultCode: true });
      } catch (error) {
        return res.status(200).json({
          message: "서버 에러가 발생하였습니다.",
          error,
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
