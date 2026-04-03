"use client";

import { createClient } from "@supabase/supabase-js";
import type { StudySet } from "./types";

const URL_KEY = "studysnap_supabase_url";
const ANON_KEY = "studysnap_supabase_anon_key";

export function getSupabaseSettings() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const envAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (typeof window === "undefined") return { url: envUrl, anonKey: envAnonKey };
  return {
    url: window.localStorage.getItem(URL_KEY) || envUrl,
    anonKey: window.localStorage.getItem(ANON_KEY) || envAnonKey,
  };
}

export function saveSupabaseSettings(url: string, anonKey: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(URL_KEY, url.trim());
  window.localStorage.setItem(ANON_KEY, anonKey.trim());
}

function client() {
  const { url, anonKey } = getSupabaseSettings();
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
