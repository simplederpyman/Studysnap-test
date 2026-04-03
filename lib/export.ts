import type { StudySet } from "./types";

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToJson(set: StudySet) {
  download(new Blob([JSON.stringify(set, null, 2)], { type: "application/json" }), `${set.title || "studysnap"}.json`);
}

export function exportToCsv(set: StudySet) {
  const rows: string[][] = [["type", "front_or_question", "back_or_answer"]];
  set.flashcards.forEach((c) => rows.push(["flashcard", c.front, c.back]));
  set.quiz.forEach((q) => rows.push(["quiz", q.question, q.answer]));
  const csv = rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
  download(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${set.title || "studysnap"}.csv`);
}
