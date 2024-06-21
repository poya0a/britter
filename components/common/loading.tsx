import { useLoading } from "@hooks/useLoading";
import { BeatLoader } from "react-spinners";

export default function Loading() {
  const { useLoadingState } = useLoading();

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "calc(100% - 140px)",
        margin: "60px 0",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        opacity: 1,
        transition: "all 0.5s ease-in-out",
        zIndex: 99999,
        display: useLoadingState ? "block" : "none",
      }}
    >
      <div
        className="spinner"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <BeatLoader
          size={12}
          color="#89A8FF"
          margin={5}
          loading={useLoadingState}
        />
      </div>
    </div>
  );
}
