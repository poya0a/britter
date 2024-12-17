import { create } from "zustand";

export interface VerifyData {
  verify: boolean;
  seq?: string;
  timeLimit?: number | string;
}

interface VerifyState {
  useVerifyState: VerifyData;
  toggleVerify: (state: VerifyData) => void;
  formatTime: (timeLimit: any) => string | null;
  startCountdown: () => void;
}

export const useVerifyStore = create<VerifyState>((set, get) => ({
  useVerifyState: {
    verify: false,
    timeLimit: "",
  },

  toggleVerify: (state: VerifyData) => {
    set((prevState) => ({
      useVerifyState: {
        ...prevState.useVerifyState,
        verify: state.verify,
        seq: state.seq !== undefined ? state.seq : prevState.useVerifyState.seq,
        timeLimit:
          state.timeLimit !== undefined
            ? state.timeLimit
            : prevState.useVerifyState.timeLimit,
      },
    }));
  },

  formatTime: (timeLimit: any) => {
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
  },

  startCountdown: () => {
    const interval = setInterval(() => {
      const { useVerifyState } = get();
      if (typeof useVerifyState.timeLimit === "number") {
        const newTimeLimit = useVerifyState.timeLimit - 1;

        if (newTimeLimit <= 0) {
          clearInterval(interval);
          set((prevState) => ({
            useVerifyState: {
              ...prevState.useVerifyState,
              timeLimit: "인증 시간이 만료되었습니다.",
            },
          }));
        } else {
          set((prevState) => ({
            useVerifyState: {
              ...prevState.useVerifyState,
              timeLimit: newTimeLimit,
            },
          }));
        }
      }
    }, 1000);
  },
}));
