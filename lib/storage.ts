"use client";

import type { StudySet } from "./types";

const KEY = "studysnap_sets";

export function readSets(): StudySet[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StudySet[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSets(sets: StudySet[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(sets));
}

export function upsertSet(set: StudySet) {
  const sets = readSets();
  const i = sets.findIndex((x) => x.id === set.id);
  if (i >= 0) sets[i] = set;
  else sets.unshift(set);
  saveSets(sets);
}
