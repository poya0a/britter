"use server";
import { NextApiResponse, NextApiRequest } from "next";
import { getDataSource } from "@database/typeorm.config";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "@server/utils/authenticateToken";
import bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { Emps } from "@entities/Emps.entity";
import { Certification } from "@entities/Certification.entity";
import { Private } from "@entities/Private.entity";
import { Space } from "@entities/Space.entity";
import { SpaceList } from "@entities/SpaceList.entity";
import { handleFileDelete } from "@server/utils/fileDelete";

// 비밀번호 일치 여부 확인
async function checkPassword(
  userWithdrawPw: string,
  userPwHash: string
): Promise<boolean> {
  return await bcrypt.compare(userWithdrawPw, userPwHash);
}

// 스페이스 사용자 제거
async function removeUserFromSpace(
  space: Space,
  uid: string,
  spaceRepository: Repository<Space>
) {
  if (space.space_users.includes(uid)) {
    const updatedUsers = space.space_users.filter((user) => user !== uid);

    space.space_users = updatedUsers;
    await spaceRepository.save(space);
  }
}

// 매니저일 경우 스페이스 삭제
async function deleteSpaceAndUsers(
  space: Space,
  uid: string,
  spaceRepository: Repository<Space>,
  spaceListRepository: Repository<SpaceList>
) {
  // 매니저인 경우 스페이스 삭제
  if (space.space_manager === uid) {
    // 사용자 목록 업데이트
    for (const user of space.space_users) {
      const userSpaceList = await spaceListRepository.findOne({
        where: { UID: user },
      });
      if (userSpaceList && userSpaceList.space.includes(space.UID)) {
        const updatedSpaceList = userSpaceList.space.filter(
          (spaceItem) => spaceItem !== space.UID
        );

        userSpaceList.space = updatedSpaceList;
        await spaceListRepository.save(userSpaceList);
      }
    }
    await spaceRepository.delete({ UID: space.UID });
  }
}

// 엔티티 삭제 로직
async function deleteEntities(
  uid: string,
  findUser: Emps,
  empsRepository: Repository<Emps>,
  certificationRepository: Repository<Certification>,
  privateRepository: Repository<Private>,
  spaceRepository: Repository<Space>,
  spaceListRepository: Repository<SpaceList>
) {
  // 프로필 이미지 삭제
  if (findUser.user_profile_seq !== 0) {
    await handleFileDelete(findUser.user_profile_seq);
  }

  // 휴대폰 인증 정보 삭제
  if (findUser.user_certification) {
    const certificationSeq = findUser.user_certification;
    findUser.user_certification = null;
    await empsRepository.save(findUser);
    await certificationRepository.delete({ seq: certificationSeq });
  }

  // 프라이빗 키 정보 삭제
  if (findUser.private_seq) {
    const privateSeq = findUser.private_seq;

    findUser.private_seq = null;
    await empsRepository.save(findUser);
    await privateRepository.delete({ seq: privateSeq });
  }

  // 스페이스 목록에서 각 스페이스 정보 삭제
  const findSpaceList = await spaceListRepository.findOne({
    where: { UID: uid },
  });
  if (findSpaceList && findSpaceList?.space.length > 0) {
    for (const space of findSpaceList.space) {
      const findSpace = await spaceRepository.findOne({
        where: { UID: space },
      });
      if (findSpace) {
        await removeUserFromSpace(findSpace, uid, spaceRepository);
        await deleteSpaceAndUsers(
          findSpace,
          uid,
          spaceRepository,
          spaceListRepository
        );
      }
    }
  }
}

// API 핸들러
export default async function handler(
  req: AuthenticatedRequest & NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "잘못된 메소드입니다.", resultCode: false });
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
        const dataSource = await getDataSource();
        const empsRepository = dataSource.getRepository(Emps);

        if (!uid) {
          return res.status(200).json({
            message: "사용자 정보를 찾을 수 없습니다.",
            resultCode: false,
          });
        }

        const findUser = await empsRepository.findOne({
          where: { UID: uid },
        });

        if (!findUser) {
          return res.status(200).json({
            message: "사용자 정보를 찾을 수 없습니다.",
            resultCode: false,
          });
        }

        const isPasswordValid = await checkPassword(
          userWithdrawPw,
          findUser.user_pw
        );

        if (!isPasswordValid) {
          return res.status(200).json({
            message: "비밀번호가 일치하지 않습니다.",
            resultCode: false,
          });
        }

        // 엔티티 삭제 처리
        const certificationRepository = dataSource.getRepository(Certification);
        const privateRepository = dataSource.getRepository(Private);
        const spaceRepository = dataSource.getRepository(Space);
        const spaceListRepository = dataSource.getRepository(SpaceList);

        await deleteEntities(
          uid,
          findUser,
          empsRepository,
          certificationRepository,
          privateRepository,
          spaceRepository,
          spaceListRepository
        );

        // 최종적으로 사용자 정보 삭제
        await empsRepository.delete({ UID: uid });

        return res
          .status(200)
          .json({ message: "회원 탈퇴가 완료되었습니다.", resultCode: true });
      } catch (error) {
        console.log(error);
        return res.status(500).json({
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
