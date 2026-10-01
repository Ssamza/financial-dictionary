import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
const configured = url.length > 0 && key.length > 0;

// createClient throws if the url is empty, so fall back to a placeholder when
// env vars are missing — isSupabaseConfigured() keeps this client from ever being used.
export const supabase = createClient(configured ? url : "https://placeholder.supabase.co", configured ? key : "placeholder");

/** Returns false if env vars are not set — valuations won't persist across devices */
export function isSupabaseConfigured(): boolean {
  return configured;
}
