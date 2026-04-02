"use client";

import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card) return;
      if (e.code === "Space") { e.preventDefault(); setFlip((v) => !v); }
      if (e.key === "ArrowLeft") grade("unknown");
      if (e.key === "ArrowRight") grade("known");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card]);

  const grade = (state: "known" | "unknown") => {
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
  };

  return (
    <div className="stack">
      <section className="card">
        <h1>Flashcard Mode</h1>
        <p className="small muted">Swipe/keyboard: links = onbekend, rechts = bekend, spatie = flip.</p>
      </section>

      <section className="card">
        <label className="label">Set</label>
        <select className="input" value={setIndex} onChange={(e) => { setSetIndex(Number(e.target.value)); setCardIndex(0); setFlip(false); }}>
          {sets.map((s, i) => <option key={s.id} value={i}>{s.title}</option>)}
        </select>
      </section>

      {!card ? <section className="card small muted">Geen flashcards beschikbaar.</section> : (
        <section className="card">
          <div style={{ height: 8, background: "#1e293b", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "#0ea5e9" }} />
          </div>
          <p className="small muted">Voortgang: {cardIndex + 1}/{cards.length}</p>
          <button className="btn" style={{ width: "100%", minHeight: 220, textAlign: "left", marginTop: 10 }} onClick={() => setFlip((v) => !v)}>
            {flip ? card.back : card.front}
          </button>
          <div className="row gap-sm" style={{ marginTop: 10, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => grade("unknown")}>← Onbekend</button>
            <button className="btn btn-primary" onClick={() => grade("known")}>Bekend →</button>
            <button className="btn" onClick={() => {
              if ("speechSynthesis" in window) {
                const u = new SpeechSynthesisUtterance(flip ? card.back : card.front);
                u.lang = set?.language === "Nederlands" ? "nl-NL" : "en-US";
                window.speechSynthesis.speak(u);
              }
            }}>Audio uitspraak</button>
          </div>
        </section>
      )}
    </div>
  );
}
