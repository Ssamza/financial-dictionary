import { supabase } from "./client";

export interface Scenario {
  key: string;
  label: string;
  tone: "bad" | "warn" | "ok";
  eps: string;
  per: string;
}

export interface SavedValuation {
  id: string;
  ticker: string;
  price: string;
  scenarios: Scenario[];
  updated_at: string;
}

const TABLE = "valuations";

export async function fetchValuations(): Promise<SavedValuation[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, ticker, price, scenarios, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SavedValuation[];
}

export async function insertValuation(v: Omit<SavedValuation, "updated_at">): Promise<void> {
  const { error } = await supabase.from(TABLE).insert({
    id: v.id,
    ticker: v.ticker,
    price: v.price,
    scenarios: v.scenarios,
  });
  if (error) throw error;
}

export async function updateValuation(v: Omit<SavedValuation, "updated_at">): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({
      ticker: v.ticker,
      price: v.price,
      scenarios: v.scenarios,
      updated_at: new Date().toISOString(),
    })
    .eq("id", v.id);
  if (error) throw error;
}

export async function deleteValuation(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
