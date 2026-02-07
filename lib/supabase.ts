import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Browser client (used in client components)
// Uses anon key — respects Row Level Security
let _supabase: SupabaseClient | null = null;

export const getSupabase = () => {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
};

// Server client (used in API routes)
// Uses service_role key — bypasses RLS, use carefully
let _supabaseAdmin: SupabaseClient | null = null;

export const getSupabaseAdmin = () => {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabaseAdmin;
};
