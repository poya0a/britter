import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { atom } from "recoil";

export interface VerifyData {
  verify: boolean;
  seq?: string;
  timeLimit?: number | string;
}

export const verifyState = atom<VerifyData>({
  key: "verifyState",
  default: {
    verify: false,
    timeLimit: "",
  },
});

export const useVerify = () => {
  const [useVerifyState, setUseVerifyState] =
    useRecoilState<VerifyData>(verifyState);

  const toggleVerify = (state: VerifyData) => {
    setUseVerifyState((prev) => ({
      ...prev,
      verify: state.verify,
      seq: state.seq !== undefined ? state.seq : prev.seq,
      timeLimit:
        state.timeLimit !== undefined ? state.timeLimit : prev.timeLimit,
    }));
  };

  useEffect(() => {
    if (typeof useVerifyState.timeLimit === "number") {
      const interval = setInterval(() => {
        setUseVerifyState((prev) => ({
          ...prev,
          timeLimit: (prev.timeLimit as number) - 1,
        }));

        if (useVerifyState.timeLimit === 0) {
          clearInterval(interval);
          setUseVerifyState((prev) => ({
            ...prev,
            timeLimit: "인증 시간이 만료되었습니다.",
          }));
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [useVerifyState.timeLimit]);

  // 인증 번호 입력 제한 시간 포맷
  const formatTime = (timeLimit: any) => {
    if (!timeLimit) {
      return null;
    }
    if (typeof timeLimit === "string") {
      return timeLimit;
    }

    const minutes = Math.floor(timeLimit / 60);
    const remainingSeconds = timeLimit % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  return {
    useVerifyState,
    toggleVerify,
    formatTime,
  };
};
