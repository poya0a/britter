"use client";
import styles from "@styles/components/_common.module.scss";
import Navigate from "../button/Navigate";
import { useRouter } from "next/navigation";
import { useRouteAndCancelAlert } from "@hooks/useRouteAndCancelAlert";

interface HeaderContent {
  type: string;
  title: string;
  content: string[];
}

export default function AuthHeader({ type }: { type: string }) {
  const router = useRouter();
  const { toggleRouteAndCancelAlert } = useRouteAndCancelAlert();

  const handleNavigate = () => {
    if (type === "reset") {
      toggleRouteAndCancelAlert({
        isActOpen: true,
        content: "입력한 정보가 저장되지 않을 수 있습니다. 이동하시겠습니까?",
        route: "/login",
      });
    } else {
      router.back();
    }
  };

  const headerContent: HeaderContent[] = [
    {
      type: "join",
      title: "회원 가입",
      content: ["회원님의 정보를 입력해 주세요."],
    },
    {
      type: "id",
      title: "아이디 찾기",
      content: ["아이디 찾기를 위해", "전화번호를 인증해 주세요."],
    },
    {
      type: "pw",
      title: "비밀번호 찾기",
      content: ["비밀번호 찾기를 위해", "전화번호를 인증해 주세요."],
    },
    {
      type: "reset",
      title: "비밀번호 재설정",
      content: ["비밀번호 재설정을 위해", "새로운 비밀번호를 입력해 주세요."],
    },
  ];

  return (
    <div className={styles.authHeader}>
      <Navigate fn={handleNavigate}></Navigate>
      <h1>{headerContent.find((header) => header.type === type)?.title}</h1>
      <p>{headerContent.find((header) => header.type === type)?.content[0]}</p>
      <p>{headerContent.find((header) => header.type === type)?.content[1]}</p>
    </div>
  );
}
