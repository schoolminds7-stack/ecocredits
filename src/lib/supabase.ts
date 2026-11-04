import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !publishableKey) {
  console.warn("Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.");
}

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  publishableKey || "missing-publishable-key",
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
);
