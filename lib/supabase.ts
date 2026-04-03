"use client";

import { createClient } from "@supabase/supabase-js";
import type { StudySet } from "./types";

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !anonKey) return null;
  try {
    return createClient(url, anonKey);
  } catch {
    return null;
  }
}

export async function syncSetToSupabase(set: StudySet) {
  const c = client();
  if (!c) return "Supabase niet geconfigureerd";

  const { error } = await c.from("study_sets").upsert(
    {
      id: set.id,
      title: set.title,
      status: set.status,
      category: set.category,
      language: set.language,
      level: set.level,
      payload: set,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  return error?.message ?? null;
}
