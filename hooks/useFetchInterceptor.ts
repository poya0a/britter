import { useEffect, useState } from "react";
import fetchApi from "@fetch/fetch";
import { FetchError } from "@fetch/types";
import { useLoading } from "./useLoading";
import { RequestConfig } from "@fetch/types";

const useFetchInterceptor = () => {
  const [isFetching, setIsFetching] = useState(false);
  const { toggleLoading } = useLoading();

  const fetchInterceptor = async (config: RequestConfig) => {
    setIsFetching(true);
    toggleLoading(true);
    try {
      const data = await fetchApi(config);
      return data;
    } catch (error) {
      if (error instanceof FetchError) {
        console.error("FetchError:", error.message);
      } else {
        console.error("Error:", error);
      }
      throw error;
    } finally {
      setIsFetching(false);
      toggleLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      setIsFetching(false);
      toggleLoading(false);
    };
  }, []);

  return { fetchInterceptor, isFetching };
};

export default useFetchInterceptor;
