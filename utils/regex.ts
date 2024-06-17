//값이 숫자로만 이루어 졌는가
const onlyNumPattern = /[^0-9]/g;

//값이 한글로만 이루어졌는가
const onlyKoreanPattern = /[^ㄱ-ㅎ|가-힣]/g;

//반드시 영문자가 1개 이상 포함, 숫자가 하나 이상 포함,문자열의 총 길이는 6~15자
// const idPattern = /^(?=.*[a-zA-Z])(?=.*[0-9]).{6,15}$/;
const idPattern = /^[a-zA-Z0-9]{6,15}$/;

const phonePattern = /^01[1|6|7|9|0][0-9]{7,8}$/;

// 반드시 영문자가 1개 이상 포함, 숫자가 하나 이상 포함,문자열의 총 길이는 8~50자
const passwordPattern = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,50}$/;

//값이 한글로만 + 1~20자리
const namePattern = /^[가-힣]{1,20}$/;

const emailPattern = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9.-]+\.(?:kr|co\.kr|or\.kr|ne\.kr|re\.kr|pe\.kr|go\.kr|com|net|org|biz|info|name))$/;

// 숫자(0~9)로만 구성, 문자열의 길이는 1~8자리
const birthPattern = /^(19|20)\d\d(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/;

const verifyNumPattern = /^\d{6}$/;

const regexValue = (pattern: RegExp, value: any) => {
  switch (pattern) {
    case phonePattern: // 숫자 외엔 모두 "" 처리
      return value?.replace(/[^0-9]/g, '');
      break;
    case idPattern: // 영어,숫자 외엔 "" 처리
      return value?.replace(/[^a-zA-Z0-9]/g, '');
      break;
    case emailPattern: // 영어,숫자,특수문자 외엔 "" 처리
      return value?.replace(/[^a-zA-Z0-9\s!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/g, '');
      break;
    case birthPattern: // 숫자 외엔 "" 처리
      return value?.replace(/[^0-9]/g, '');
      break;
    case passwordPattern: // 영어,숫자,특수문자 외엔 "" 처리
      return value?.replace(/[^a-zA-Z0-9\s!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/g, '');
      break;
    case namePattern: //한글외의 것은 공백
      return value?.replace(/[^ㄱ-ㅎ|가-힣]/g, '');
      break;
    case verifyNumPattern: //숫자외엔모두공백처리
      return value?.replace(/[^0-9]/g, '');
      break;
    default:
      console.log('regex함수 에러');
  }
};

export { verifyNumPattern, onlyNumPattern, phonePattern, passwordPattern, idPattern, onlyKoreanPattern, emailPattern, birthPattern, namePattern, regexValue };
