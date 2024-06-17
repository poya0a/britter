"use client";
import { useState } from "react";
import commonStyles from "@styles/components/_common.module.scss";
import { ErrorMessage } from "@hookform/error-message";

export default function PhoneNumberInput({ register, errors }: any) {
  return (
    <>
      <div className={commonStyles.inputPhoneNumber}>
        <label htmlFor="userHP" className={commonStyles.required}>
          전화번호
        </label>
        <div className={commonStyles.inputPhoneNumberWrapper}>
          <input
            type="text"
            id="userHp"
            className="input"
            placeholder="휴대전화 번호를 입력해 주세요."
            maxLength={11}
            {...register}
          />
          <button
            type="button"
            className={`button ${commonStyles.buttonPasswordType}`}
          >
            인증 번호 받기
          </button>
        </div>
      </div>
      <ErrorMessage
        errors={errors}
        name="user_hp"
        render={({ message }) => (
          <p className={commonStyles.errorMessage}>{message}</p>
        )}
      />
      <div className={commonStyles.inputPhoneNumber}>
        <label htmlFor="verifyNumber" className={commonStyles.required}>
          인증번호
        </label>
        <div className={commonStyles.inputPhoneNumberWrapper}>
          <input
            type="text"
            id="verifyNumber"
            className="input"
            placeholder="인증 번호를 입력해 주세요."
            maxLength={6}
          />
          <button
            type="button"
            className={`button ${commonStyles.buttonPasswordType}`}
          >
            인증 번호 확인
          </button>
        </div>
      </div>
    </>
  );
}
