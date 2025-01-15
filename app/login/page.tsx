"use client";
import inputStyles from "@styles/components/_input.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";
import styles from "./page.module.scss";
import Logo from "@components/common/Logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PasswordInput from "@components/input/PasswordInput";
import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import { useAlertStore } from "@stores/popup/useAlertStore";
import encryptRSA from "@utils/encryptRSA";
import storage from "@fetch/auth/storage";

export default function Login() {
  const router = useRouter();
  const {
    register,
    getValues,
    setError,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const { toggleAlert } = useAlertStore();

  const login = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (typeof window !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const idValue = getValues("user_id");
    const pwValue = getValues("user_pw");

    if (!idValue || !pwValue) {
      if (!idValue) {
        setError("user_id", {
          type: "empty",
          message: "아이디를 입력해 주세요.",
        });
      }
      if (!pwValue) {
        setError("user_pw", {
          type: "empty",
          message: "비밀번호를 입력해 주세요.",
        });
      }
      return;
    } else {
      try {
        const getKey = await fetch("api/auth/key", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (getKey.ok) {
          const getKeyRes = await getKey.json();
          if (getKeyRes.resultCode) {
            const userIdEncrypted = await encryptRSA(getKeyRes.message, idValue);

            const userPwEncrypted = await encryptRSA(getKeyRes.message, pwValue);

            const encryptedLoginFormData = {
              user_id: userIdEncrypted,
              user_pw: userPwEncrypted,
            };

            const postLogin = await fetch("api/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(encryptedLoginFormData),
            });

            if (postLogin.ok) {
              const postLoginRes = await postLogin.json();
              if (postLoginRes.resultCode) {
                storage.setAccessToken(postLoginRes.accessToken);
                storage.setRefreshToken(postLoginRes.refreshToken);
                reset();
                router.push("/");
              } else {
                toggleAlert(postLoginRes.message);
              }
            } else {
              toggleAlert("서버 에러가 발생하였습니다. 다시 시도해 주세요.");
            }
          }
        } else {
          toggleAlert("서버 에러가 발생하였습니다. 다시 시도해 주세요.");
        }
      } catch (error) {
        toggleAlert("네트워크 오류가 발생하였습니다. 다시 시도해 주세요.");
      }
    }
  };

  const notService = () => {
    toggleAlert("서비스 준비 중입니다.");
  };

  return (
    <div className={styles.login}>
      <Logo />
      <form>
        <div className={styles.loginWrapper}>
          <div className={inputStyles.inputText}>
            <label htmlFor="userId">아이디</label>
            <input
              type="text"
              id="userId"
              className="input"
              placeholder="아이디를 입력해 주세요."
              autoComplete="userId"
              {...register("user_id", {
                required: true,
              })}
            />
          </div>
          <ErrorMessage
            errors={errors}
            name="user_id"
            render={({ message }) => <p className={inputStyles.errorMessage}>{message}</p>}
          />
          <PasswordInput
            id="userPw"
            name="비밀번호"
            placeholder="비밀번호를 입력해 주세요."
            register={{
              ...register("user_pw", {
                required: true,
              }),
            }}
          />
          <ErrorMessage
            errors={errors}
            name="user_pw"
            render={({ message }) => <p className={inputStyles.errorMessage}>{message}</p>}
          />
        </div>
        <button type="submit" className={`button ${buttonStyles.buttonBlue}`} onClick={login}>
          로그인
        </button>
      </form>
      <div className={buttonStyles.textLine}>
        <em className="normal">간편 로그인</em>
      </div>

      <div className={styles.social}>
        <button type="button" className={`button ${buttonStyles.buttonCircleLine}`} onClick={notService}>
          <img src="images/icon/kakao.png" alt="kakao" />
        </button>
        <button type="button" className={`button ${buttonStyles.buttonCircleLine}`} onClick={notService}>
          <img src="images/icon/naver.png" alt="naver" />
        </button>
        <button type="button" className={`button ${buttonStyles.buttonCircleLine}`} onClick={notService}>
          <img src="images/icon/apple.png" alt="apple" />
        </button>
      </div>

      <p className={styles.goToJoin}>
        아직 계정이 없으신가요? <Link href={"/join"}>회원가입</Link>
      </p>

      <div className={`button ${buttonStyles.buttonJustText}`}>
        <Link href={"/find-id"} className="button">
          아이디 찾기
        </Link>
        <Link href={"/find-password"} className="button">
          비밀번호 찾기
        </Link>
      </div>
    </div>
  );
}
