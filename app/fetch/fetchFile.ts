import fetchApi from "./fetch";
import requests from "./requests";

const fetchFile = async (seq: number): Promise<string> => {
  try {
    const res = await fetchApi({
      method: "GET",
      url: `${requests.GET_FILE}?seq=${seq}`,
    });

    if (!res.resultCode) {
      throw new Error(res.message);
    }
    return res.data.file_path;
  } catch (error) {
    throw error;
  }
};

export default fetchFile;
