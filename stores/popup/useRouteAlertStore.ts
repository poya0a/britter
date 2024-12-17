import { create } from "zustand";

interface RouteAlertData {
  isActOpen: boolean;
  content: string;
  route: string;
}

interface RouteAlertStore {
  useRouteAlertState: RouteAlertData;
  toggleRouteAlert: (props: RouteAlertData) => void;
}

export const useRouteAlertStore = create<RouteAlertStore>((set) => ({
  useRouteAlertState: {
    isActOpen: false,
    content: "",
    route: "/",
  },

  toggleRouteAlert: (props: RouteAlertData) => {
    set({
      useRouteAlertState: {
        isActOpen: props.isActOpen,
        content: props.content,
        route: props.route,
      },
    });
  },
}));
