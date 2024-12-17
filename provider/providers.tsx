"use client";
import { useState, useEffect } from "react";
import { onScrollLock, onScrollUnlock } from "@utils/scroll";
import { useScrollLockStore } from "@stores/useScrollLockStore";
import Loading from "@components/common/loading";
import storage from "@fetch/auth/storage";
import { usePathname } from "next/navigation";

const ScrollLockHandler = () => {
  const { isLocked } = useScrollLockStore();

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

  return (
    <>
      {children}
      <Loading />
      <ScrollLockHandler />
    </>
  );
};

export default Providers;
