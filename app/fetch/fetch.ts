import storage from "./auth/storage";
import { RequestConfig } from "./types";
import requests from "./requests";
import { FetchError } from "./types";

const fetchApi = async (config: RequestConfig): Promise<any> => {
  const { method, url, headers, body } = config;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    "User-Token": storage.getAccessToken() || "",
  };

  const finalHeaders: HeadersInit = { ...defaultHeaders, ...headers };

  const requestOptions: RequestInit = {
    method,
    headers: finalHeaders,
    body,
  };

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      if (response.status === 401) {
        const newAccessToken = await refreshToken();
        if (newAccessToken) {
          finalHeaders["User-Token"] = newAccessToken;
          const retryResponse = await fetch(url, {
            ...requestOptions,
            headers: finalHeaders,
          });
          return retryResponse.json();
        }
      }

      if (response.status.toString().startsWith("5")) {
        throw new FetchError("서버 오류가 발생했습니다.", response.status);
      }

      const errorData = await response.json();
      throw new FetchError(
        errorData.message || "에러가 발생했습니다.",
        response.status
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof FetchError) {
      throw error;
    } else {
      throw new FetchError("네트워크 오류가 발생했습니다.", 0);
    }
  }
};

const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(requests.REFRESH_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Refresh-Token": storage.getRefreshToken() || "",
      },
    });

    if (!response.ok) {
      throw new Error("토큰 갱신 실패");
    }

    const { accessToken, refreshToken } = await response.json();

    if (accessToken) {
      storage.setAccessToken(accessToken);
    }

    if (refreshToken) {
      storage.setRefreshToken(refreshToken);
    }

    return accessToken;
  } catch (error) {
    storage.removeToken();
    window.location.href = "/login";
    return null;
  }
};

export default fetchApi;
