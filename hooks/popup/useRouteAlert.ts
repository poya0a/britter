import { useRecoilState } from "recoil";
import { atom } from "recoil";

interface RouteAlertData {
  isActOpen: boolean;
  content: string;
  route: string;
}

export const routeAlertState = atom<RouteAlertData>({
  key: "routeAlertState",
  default: {
    isActOpen: false,
    content: "",
    route: "/",
  },
});

export const useRouteAlert = () => {
  const [useRouteAlertState, setUseRouteAlertState] =
    useRecoilState<RouteAlertData>(routeAlertState);

  const toggleRouteAlert = (props: RouteAlertData) => {
    setUseRouteAlertState({
      isActOpen: props.isActOpen,
      content: props.content,
      route: props.route,
    });
  };

  return {
    useRouteAlertState,
    toggleRouteAlert,
  };
};
