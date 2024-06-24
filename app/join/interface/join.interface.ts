interface JoinForm {
  domestic_id?: string;
  user_id: string;
  user_pw: string;
  user_pw_check?: string;
  user_name: string;
  user_hp: string;
  verify_number?: string;
  user_email?: string;
  user_nick_name?: string;
  user_birth?: number;
  terms: string;
}

export type { JoinForm };
