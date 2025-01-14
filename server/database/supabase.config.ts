
"use server";
import "reflect-metadata";
import { config } from "dotenv";
import { createClient } from '@supabase/supabase-js'

config();

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("서버 정보가 올바르지 않습니다.");
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

export default supabase;