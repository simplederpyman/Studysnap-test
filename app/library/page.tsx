"use client";

import { useMemo, useState } from "react";
import { readSets } from "@/lib/storage";

export default function LibraryPage() {
  const [sets] = useState(readSets());
  const [folders, setFolders] = useState([{ id: "root", name: "Hoofdmap", parentId: "" }]);
  const [name, setName] = useState("");
  const [parent, setParent] = useState("root");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");

  const filtered = useMemo(() => {
    return sets.filter((s) => {
      const q = query.toLowerCase();
      const text = s.title.toLowerCase().includes(q) || s.tags.some((t) => t.toLowerCase().includes(q));
      const mode =
        type === "all" ||
        (type === "quiz" && s.quiz.length > 0) ||
        (type === "flashcards" && s.flashcards.length > 0) ||
        (type === "explanations" && s.explanations.length > 0);
      return text && mode;
    });
  }, [query, sets, type]);

  const addFolder = () => {
    if (!name.trim()) return;
    setFolders((prev) => [...prev, { id: crypto.randomUUID(), name: name.trim(), parentId: parent }]);
    setName("");
  };

  return (
    <div className="stack">
      <div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>📚 Library</h1>
        <p className="small muted">Organiseer, doorzoek en beheer je studiemateriaal.</p>
      </div>

      {/* Search & filter */}
      <div className="card">
        <div className="grid-3">
          <div>
            <label className="label">Zoeken</label>
            <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Titel of tag…" />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">Alles</option>
              <option value="quiz">Quiz</option>
              <option value="flashcards">Flashcards</option>
              <option value="explanations">Uitleg</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <p className="small muted">
              📤 Delen · Importeer Anki/CSV · Exporteer PDF/JSON
            </p>
          </div>
        </div>
      </div>

      {/* Folder management */}
      <div className="card">
        <h2 style={{ fontWeight: 700, marginBottom: "1rem" }}>📁 Mappenstructuur</h2>
        <div className="grid-3">
          <div>
            <label className="label">Nieuwe map</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mapnaam" />
          </div>
          <div>
            <label className="label">In map</label>
            <select className="input" value={parent} onChange={(e) => setParent(e.target.value)}>
              {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="btn btn-primary w-full" onClick={addFolder}>+ Map toevoegen</button>
          </div>
        </div>
        <div className="flex gap-2 wrap" style={{ marginTop: "1rem" }}>
          {folders.map((f) => (
            <span key={f.id} className="badge" style={{ padding: ".3rem .75rem" }}>
              📁 {f.name}
            </span>
          ))}
        </div>
      </div>

      {/* Sets */}
      <div className="card">
        <h2 style={{ fontWeight: 700, marginBottom: "1rem" }}>
          📋 Sets
          <span className="small muted" style={{ marginLeft: ".5rem", fontWeight: 400 }}>({filtered.length})</span>
        </h2>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: ".75rem" }}>🔍</div>
            <p className="muted small">Geen resultaten gevonden.</p>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map((s) => (
              <article key={s.id} className="card card-sm">
                <h3 className="truncate" style={{ marginBottom: ".35rem" }}>{s.title}</h3>
                <div className="flex gap-2" style={{ marginBottom: ".5rem", flexWrap: "wrap" }}>
                  <span className="badge">{s.category}</span>
                  {s.tags.slice(0, 2).map((t) => (
                    <span key={t} className="small muted">#{t}</span>
                  ))}
                </div>
                <p className="small muted">{new Date(s.updatedAt).toLocaleDateString("nl-NL")}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
