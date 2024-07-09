import { usePost } from "@/hooks/usePost";
import styles from "@styles/components/_common.module.scss";
import { useRouter } from "next/navigation";

export default function HeaderLogo() {
  const route = useRouter();
  const { setPageSeq } = usePost();

  const goToHome = () => {
    route.push("/");
    setPageSeq({ seq: "", pSeq: "" });
  };

  return (
    <button className={`button ${styles.headerLogo}`} onClick={goToHome}>
      <i className="normal">BRITTER</i>
    </button>
  );
}
