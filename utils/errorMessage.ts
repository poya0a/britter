import {
  birthPattern,
  emailPattern,
  idPattern,
  passwordPattern,
  phonePattern,
} from "./regex";

const getErrorMassage = (fieldName: String) => {
  switch (fieldName) {
    case (fieldName = "user_id"):
      return "아이디를 입력해 주세요.";
      break;
    case (fieldName = "user_pw"):
      return "비밀번호를 입력해 주세요.";
      break;
    case (fieldName = "user_pw_check"):
      return "비밀번호를 한 번 더 입력해 주세요.";
      break;
    case (fieldName = "user_name"):
      return "이름을 입력해 주세요.";
      break;
    case (fieldName = "user_hp"):
      return "휴대폰 번호를 입력해 주세요.";
      break;
    case (fieldName = "verify_number"):
      return "인증 번호를 입력해 주세요.";
      break;
    case (fieldName = "terms"):
      return "필수 이용 약관에 동의해 주세요.";
      break;
    default:
  }
};

const getValidMassage = (fieldName: String) => {
  switch (fieldName) {
    case (fieldName = "user_id"):
      return "6자리 이상 15자 이하 영문 혹은 영문과 숫자를 조합하여 입력해 주세요.";
      break;
    case (fieldName = "user_pw"):
      return "영문, 숫자 포함 8자리 이상 50자 이하 입력해 주세요.";
      break;
    case (fieldName = "user_pw_check"):
      return "영문, 숫자 포함 8자리 이상 50자 이하 입력해 주세요.";
      break;
    case (fieldName = "user_email"):
      return "이메일 형식이 올바르지 않습니다.";
      break;
    case (fieldName = "user_hp"):
      return "잘못된 휴대폰 번호입니다. 확인 후 다시 입력해 주세요.";
      break;
    case (fieldName = "user_birth"):
      return "생년월일 형식이 올바르지 않습니다.";
      break;
    default:
  }
};

interface ValidationRules {
  [key: string]: {
    pattern: RegExp;
    errorMessage: string;
  };
}

const validationRules: ValidationRules = {
  user_id: {
    pattern: idPattern,
    errorMessage:
      "6자리 이상 15자 이하의 영문 혹은 영문과 숫자를 조합하여 입력해 주세요.",
  },
  user_pw: {
    pattern: passwordPattern,
    errorMessage: "영문, 숫자를 포함 8자리 이상 50자 이하로 입력해 주세요.",
  },
  user_email: {
    pattern: emailPattern,
    errorMessage: "이메일 형식이 올바르지 않습니다.",
  },
  user_hp: {
    pattern: phonePattern,
    errorMessage: "잘못된 휴대폰 번호입니다. 확인 후 다시 입력해 주세요.",
  },
  user_birth: {
    pattern: birthPattern,
    errorMessage: "생년월일 형식이 올바르지 않습니다.",
  },
};

export { getErrorMassage, getValidMassage, validationRules };
