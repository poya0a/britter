import { usePostStore } from "@stores/user/usePostStore";
import styles from "@styles/components/_common.module.scss";
import { useRouter } from "next/navigation";

export default function HeaderLogo() {
  const route = useRouter();
  const { setPageSeq } = usePostStore();

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
