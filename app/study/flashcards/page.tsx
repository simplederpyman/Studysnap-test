"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { readSets, saveSets } from "@/lib/storage";

export default function FlashcardModePage() {
  const [sets, setSets] = useState(readSets());
  const [setIndex, setSetIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [flip, setFlip] = useState(false);

  const set = sets[setIndex];
  const cards = set?.flashcards ?? [];
  const card = cards[cardIndex];

  const progress = useMemo(() => cards.length ? Math.round(((cardIndex + 1) / cards.length) * 100) : 0, [cardIndex, cards.length]);

  const grade = useCallback((state: "known" | "unknown") => {
    if (!set || !card) return;
    const next = [...sets];
    const delta = state === "known" ? 4 : -3;
    next[setIndex].stats.retentionPercentage = Math.max(0, Math.min(100, next[setIndex].stats.retentionPercentage + delta));
    next[setIndex].stats.practiceCount += 1;
    next[setIndex].stats.practiceMinutes += 1;
    next[setIndex].updatedAt = new Date().toISOString();
    setSets(next);
    saveSets(next);
    setFlip(false);
    setCardIndex((i) => (i + 1 >= cards.length ? 0 : i + 1));
  }, [card, cards.length, set, setIndex, sets]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card) return;
      if (e.code === "Space") { e.preventDefault(); setFlip((v) => !v); }
      if (e.key === "ArrowLeft") grade("unknown");
      if (e.key === "ArrowRight") grade("known");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, grade]);

  return (
    <div className="stack">
      <div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>🃏 Flashcard Mode</h1>
        <p className="small muted">Spatie = flip · ← onbekend · → bekend</p>
      </div>

      <div className="card">
        <label className="label">Selecteer set</label>
        <select
          className="input"
          value={setIndex}
          onChange={(e) => { setSetIndex(Number(e.target.value)); setCardIndex(0); setFlip(false); }}
        >
          {sets.map((s, i) => <option key={s.id} value={i}>{s.title}</option>)}
        </select>
      </div>

      {!card ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
          <p className="muted">Geen flashcards beschikbaar voor deze set.</p>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="card card-sm">
            <div className="flex items-center justify-between" style={{ marginBottom: ".5rem" }}>
              <span className="small muted">Voortgang: {cardIndex + 1}/{cards.length}</span>
              <span className="small muted">{progress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Card */}
          <button
            className="card"
            style={{
              width: "100%",
              minHeight: 260,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontSize: "1.15rem",
              lineHeight: 1.6,
              background: flip
                ? "rgba(99,102,241,0.1)"
                : "var(--glass-bg)",
              borderColor: flip
                ? "rgba(99,102,241,0.3)"
                : "var(--glass-border)",
              transition: "all .3s ease",
              border: "none",
              color: "var(--text)",
              padding: "2rem",
            }}
            onClick={() => setFlip((v) => !v)}
          >
            <div>
              <div className="small muted" style={{ marginBottom: ".75rem" }}>
                {flip ? "↩ Achterkant" : "Voorkant →"}
              </div>
              <div>{flip ? card.back : card.front}</div>
            </div>
          </button>

          {/* Actions */}
          <div className="flex gap-3" style={{ flexWrap: "wrap" }}>
            <button
              className="btn"
              style={{ flex: 1, minWidth: 120 }}
              onClick={() => grade("unknown")}
            >
              ← Onbekend
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, minWidth: 120 }}
              onClick={() => grade("known")}
            >
              Bekend →
            </button>
            <button
              className="btn"
              onClick={() => {
                if ("speechSynthesis" in window) {
                  const u = new SpeechSynthesisUtterance(flip ? card.back : card.front);
                  u.lang = set?.language === "Nederlands" ? "nl-NL" : "en-US";
                  window.speechSynthesis.speak(u);
                }
              }}
            >
              🔊
            </button>
          </div>
        </>
      )}
    </div>
  );
}
