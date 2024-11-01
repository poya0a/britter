import storage from "./auth/storage";
import { RequestConfig } from "./types";
import requests from "./requests";
import { FetchError } from "./types";

const fetchApi = async (config: RequestConfig): Promise<any> => {
  const { method, url, headers, body } = config;
  const token = storage.getAccessToken();
  if (!token || token === "" || token === undefined) return;

  const defaultHeaders: HeadersInit = {
    // "Content-Type": "application/json",
    "User-Token": token,
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
        } else {
          throw new FetchError("로그아웃되었습니다.", response.status);
        }
      }

      // 토큰 X
      if (response.status === 403) {
        throw new FetchError("로그아웃되었습니다.", response.status);
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

    const data = await response.json();
    if (!data) throw new Error("데이터가 없습니다.");

    return data;
  } catch (error) {
    throw error;
  }
};

const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(requests.REFRESH_TOKEN, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Refresh-Token": storage.getRefreshToken() || "",
      },
    });

    if (!response.ok) {
      throw new FetchError("토큰 갱신 실패", response.status);
    }

    const responseData = await response.json();

    // 갱신할 토큰 X
    if (!responseData || responseData.resultCode !== true) {
      throw new FetchError("토큰 갱신 실패", response.status);
    }

    const { accessToken, refreshToken } = responseData;

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
