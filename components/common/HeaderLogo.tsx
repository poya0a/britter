import Link from "next/link";
import styles from "@styles/components/_common.module.scss";

export default function HeaderLogo() {
  return (
    <Link href="/" className={`link ${styles.headerLogo}`}>
      <i className="normal">BRITTER</i>
    </Link>
  );
}
