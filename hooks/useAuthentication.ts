import { useRouter } from "next/navigation";
import storage from "@fetch/auth/storage";

const useAuthentication = () => {
  const router = useRouter();

  const checkTokenAndNavigate = async (pathname: string) => {
    try {
      const userToken = storage.getAccessToken();

      const pathWithoutToken = [
        "/login",
        "/join",
        "/find-id",
        "/find-password",
        "/reset-password",
        "/complete",
      ];

      if (!userToken && !pathWithoutToken.includes(pathname)) {
        router.replace("/login");
      } else if (userToken && pathWithoutToken.includes(pathname)) {
        router.replace("/");
      }
    } catch (error) {
      router.replace("/login");
      storage.removeToken();
    }
  };

  return { checkTokenAndNavigate };
};

export { useAuthentication };
