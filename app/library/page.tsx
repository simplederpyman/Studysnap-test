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
      <section className="card">
        <h1>Library / Organisatie</h1>
        <p className="small muted">Mappen, zoeken/filteren, favorieten/recent en delen/import/export.</p>
      </section>

      <section className="card grid-3">
        <div>
          <label className="label">Zoeken</label>
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="titel of tag" />
        </div>
        <div>
          <label className="label">Type filter</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">Alles</option>
            <option value="quiz">Quiz</option>
            <option value="flashcards">Flashcards</option>
            <option value="explanations">Uitleg</option>
          </select>
        </div>
        <div className="small muted">
          Delen: publieke link, invite per e-mail, embed code. Import: Anki/Quizlet/CSV. Export: PDF/Word/JSON/API.
        </div>
      </section>

      <section className="card">
        <h2>Mappenstructuur</h2>
        <div className="grid-3">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nieuwe map" />
          <select className="input" value={parent} onChange={(e) => setParent(e.target.value)}>
            {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button className="btn" onClick={addFolder}>Map toevoegen</button>
        </div>
      </section>

      <section className="card">
        <h2>Sets</h2>
        {filtered.length === 0 ? <p className="small muted">Geen resultaten.</p> : (
          <div className="grid-3">
            {filtered.map((s) => (
              <article key={s.id} className="card">
                <h3>{s.title}</h3>
                <p className="small muted">{s.category} · {new Date(s.updatedAt).toLocaleDateString("nl-NL")}</p>
                <p className="small muted">Tags: {s.tags.join(", ") || "-"}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
