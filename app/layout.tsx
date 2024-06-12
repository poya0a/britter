import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@styles/globals.scss";
import Header from "@/components/common/Header";
import styles from "./[userId]/page.module.scss";

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
        <Header />
        <main className={styles.main}>
          <div className={styles.mainView}>{children}</div>
        </main>
      </body>
    </html>
  );
}
