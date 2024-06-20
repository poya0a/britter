"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import commonStyles from "@styles/components/_common.module.scss";

interface InputProps {
  id: string;
  name: string;
  placeholder: string;
  register: any;
  onKeyUp?: Function;
}

export default function PasswordInput({
  id,
  name,
  placeholder,
  register,
  onKeyUp,
}: InputProps) {
  const pathName = usePathname();
  const [type, setType] = useState<string>("password");

  const handleShowHide = () => {
    if (type === "password") {
      setType("text");
    } else {
      setType("password");
    }
  };

  return (
    <div className={commonStyles.inputPassword}>
      <label
        htmlFor={id}
        className={pathName === "/login" ? "" : commonStyles.required}
      >
        {name}
      </label>
      <div className={commonStyles.inputPasswordWrapper}>
        <input
          type={type}
          id={id}
          className="input"
          placeholder={placeholder}
          autoComplete="new-password"
          maxLength={50}
          {...register}
          onKeyUp={onKeyUp}
        />
        <button
          type="button"
          className={`button ${commonStyles.buttonPasswordType}`}
          onClick={handleShowHide}
        >
          <img
            src={
              type === "password"
                ? "/images/icon/view-input.svg"
                : "/images/icon/hide-input.svg"
            }
            alt=""
          />
        </button>
      </div>
    </div>
  );
}
