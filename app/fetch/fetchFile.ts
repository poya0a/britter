import fetchApi from "./fetch";
import requests from "./requests";

const fetchFile = async (seq: number): Promise<string> => {
  try {
    const res = await fetchApi({
      method: "GET",
      url: `${requests.GET_FILE}?seq=${seq}`,
    });

    if (!res || !res?.resultCode) {
      throw new Error("서버 에러가 발생하였습니다.");
    }
    return res.data.file_path;
  } catch (error) {
    throw error;
  }
};

export default fetchFile;
