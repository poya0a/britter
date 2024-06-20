"use client";
import { useState, useEffect } from "react";
import { RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { onScrollLock, onScrollUnlock } from "@utils/scroll";
import { useScrollLock } from "@hooks/useScrollLock";

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
        <ScrollLockHandler />
      </QueryClientProvider>
    </RecoilRoot>
  );
};

export default Providers;
