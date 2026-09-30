import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

export const supabase = createClient(url, key);

/** Returns false if env vars are not set — valuations won't persist across devices */
export function isSupabaseConfigured(): boolean {
  return url.length > 0 && key.length > 0;
}
