import { create } from "zustand";

interface RouteAndCancelAlertData {
  isActOpen: boolean;
  content: string;
  route: string;
}

interface RouteAndCancelAlertStore {
  useRouteAndCancelAlertState: RouteAndCancelAlertData;
  toggleRouteAndCancelAlert: (props: RouteAndCancelAlertData) => void;
}

export const useRouteAndCancelAlertStore = create<RouteAndCancelAlertStore>(
  (set) => ({
    useRouteAndCancelAlertState: {
      isActOpen: false,
      content: "",
      route: "/",
    },

    toggleRouteAndCancelAlert: (props: RouteAndCancelAlertData) => {
      set({
        useRouteAndCancelAlertState: {
          isActOpen: props.isActOpen,
          content: props.content,
          route: props.route,
        },
      });
    },
  })
);
