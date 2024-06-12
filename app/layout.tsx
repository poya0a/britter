import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@styles/globals.scss";
import styles from "./[userId]/page.module.scss";
import Logo from "@components/common/Logo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | BRITTER",
    default: "BRITTER",
  },
  description: "Creating A Better World Through IT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" id="html">
      <body id="body" className={inter.className}>
        <header className={styles.header}>
          <Logo />
          <button className={`button ${styles.profileButton}`}>
            <img src="/images/profile.svg" alt="profile" />
          </button>
        </header>
        <main className={styles.main}>
          <div className={styles.mainView}>{children}</div>
        </main>
      </body>
    </html>
  );
}
