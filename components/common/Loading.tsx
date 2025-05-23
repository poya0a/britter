import { useLoadingStore } from "@stores/useLoadingStore";
import { BeatLoader } from "react-spinners";

const Loading = () => {
  const { isLoading } = useLoadingStore();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        opacity: 1,
        transition: "all 0.5s ease-in-out",
        zIndex: 99999,
        display: isLoading ? "block" : "none",
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
        <BeatLoader size={12} color="#89A8FF" margin={5} loading={isLoading} />
      </div>
    </div>
  );
};

export default Loading;
