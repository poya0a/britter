"use client";
import { useState, useEffect } from "react";
import { RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { onScrollLock, onScrollUnlock } from "@utils/scroll";
import { useScrollLock } from "@hooks/useScrollLock";
import Loading from "@components/common/loading";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import storage from "@fetch/auth/storage";
import { usePathname } from "next/navigation";

const ScrollLockHandler = () => {
  const { isLocked } = useScrollLock();

  useEffect(() => {
    if (isLocked) {
      onScrollLock();
    } else {
      onScrollUnlock();
    }
  }, [isLocked]);
  return null;
};

const Providers = ({ children }: { children: React.ReactNode }) => {
  const userToken = storage.getAccessToken();
  const pathname = usePathname();
  const pathWithoutToken = [
    "/login",
    "/join",
    "/find-id",
    "/find-password",
    "/reset-password",
    "/complete",
  ];

  useEffect(() => {
    if (userToken && pathname && pathWithoutToken.includes(pathname)) {
      window.location.href = "/";
    }
  }, [pathname]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        {children}
        <Loading />
        <ScrollLockHandler />
        <ReactQueryDevtools />
      </QueryClientProvider>
    </RecoilRoot>
  );
};

export default Providers;
