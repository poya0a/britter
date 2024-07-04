import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@styles/globals.scss";
import Providers from "@provider/providers";
import Header from "@components/common/Header";
import styles from "./page.module.scss";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | BRITTER",
    default: "BRITTER",
  },
  description: "Creating A Better World Through IT",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" id="html">
      <body id="body" className={inter.className}>
        <Providers>
          <Header />
          <main className={styles.main}>
            <div className={styles.mainView}>{children}</div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
