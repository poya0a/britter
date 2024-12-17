import { create } from "zustand";
import fetchApi from "@fetch/fetch";
import { FetchError } from "@fetch/types";
import { RequestConfig } from "@fetch/types";
import { useLoadingStore } from "./useLoadingStore";

const useFetchInterceptorStore = create((set) => ({
  isFetching: false,
  setIsFetching: (isFetching: boolean) => set({ isFetching }),

  fetchInterceptor: async (config: RequestConfig) => {
    const { toggleLoading } = useLoadingStore.getState();
    set({ isFetching: true });
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
      set({ isFetching: false });
      toggleLoading(false);
    }
  },
}));

export default useFetchInterceptorStore;
