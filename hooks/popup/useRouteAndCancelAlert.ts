import { useRecoilState } from "recoil";
import { atom } from "recoil";

interface RouteAndCancelAlertData {
  isActOpen: boolean;
  content: string;
  route: string;
}

export const routeAndCancelAlertState = atom<RouteAndCancelAlertData>({
  key: "routeAndCancelAlertState",
  default: {
    isActOpen: false,
    content: "",
    route: "/",
  },
});

export const useRouteAndCancelAlert = () => {
  const [useRouteAndCancelAlertState, setUseRouteAndCancelAlertState] =
    useRecoilState<RouteAndCancelAlertData>(routeAndCancelAlertState);

  const toggleRouteAndCancelAlert = (props: RouteAndCancelAlertData) => {
    setUseRouteAndCancelAlertState({
      isActOpen: props.isActOpen,
      content: props.content,
      route: props.route,
    });
  };

  return {
    useRouteAndCancelAlertState,
    toggleRouteAndCancelAlert,
  };
};
