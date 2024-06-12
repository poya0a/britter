import Link from "next/link";
import styles from "@styles/components/_common.module.scss";

export default function Logo() {
  return (
    <Link href="/" className={`link ${styles.logo}`}>
      <i className="normal">BRITTER</i>
    </Link>
  );
}
