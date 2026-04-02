"use client";

import { useMemo, useState } from "react";
import { readSets } from "@/lib/storage";

export default function ReadModePage() {
  const [sets] = useState(readSets());
  const [setIndex, setSetIndex] = useState(0);
  const [highlight, setHighlight] = useState("");
  const [notes, setNotes] = useState("");

  const set = sets[setIndex];
  const text = useMemo(() => set ? set.explanations.map((e) => `${e.title}\n${e.content}`).join("\n\n") : "", [set]);

  return (
    <div className="stack">
      <section className="card">
        <h1>Leesmodus</h1>
        <p className="small muted">Opgeruimde uitleg, highlight/notities, text-to-speech en print/PDF export.</p>
      </section>

      <section className="card">
        <label className="label">Set</label>
        <select className="input" value={setIndex} onChange={(e) => setSetIndex(Number(e.target.value))}>
          {sets.map((s, i) => <option key={s.id} value={i}>{s.title}</option>)}
        </select>
      </section>

      <section className="card stack">
        <div className="row gap-sm" style={{ flexWrap: "wrap" }}>
          <button className="btn" onClick={() => {
            if ("speechSynthesis" in window) {
              const u = new SpeechSynthesisUtterance(text);
              u.lang = set?.language === "Nederlands" ? "nl-NL" : "en-US";
              window.speechSynthesis.speak(u);
            }
          }}>Text-to-speech</button>
          <button className="btn" onClick={() => window.print()}>Export PDF/print</button>
        </div>

        <div>
          <label className="label">Highlight term</label>
          <input className="input" value={highlight} onChange={(e) => setHighlight(e.target.value)} placeholder="zoekterm" />
        </div>

        <div>
          <label className="label">Notities</label>
          <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="jouw notities" />
        </div>

        <article className="card small">
          {text
            ? text.split("\n").map((line, i) => {
                if (!highlight) return <p key={i}>{line}</p>;
                const parts = line.split(new RegExp(`(${highlight})`, "ig"));
                return (
                  <p key={i}>
                    {parts.map((part, j) => (
                      <span key={j} style={part.toLowerCase() === highlight.toLowerCase() ? { background: "rgba(250,204,21,.25)" } : undefined}>{part}</span>
                    ))}
                  </p>
                );
              })
            : "Geen uitleg beschikbaar."}
        </article>
      </section>
    </div>
  );
}
