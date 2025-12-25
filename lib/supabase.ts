import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbLeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  wpm: number;
  accuracy: number;
  mode: string;
  time_setting?: number;
  word_count?: number;
  created_at: string;
}

export interface DbUser {
  id: string;
  email: string;
  username: string;
  created_at: string;
}
