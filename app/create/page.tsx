"use client";

import { useMemo, useState } from "react";
import { exportToCsv, exportToJson } from "@/lib/export";
import { readSets, upsertSet } from "@/lib/storage";
import { syncSetToSupabase } from "@/lib/supabase";
import type { GenerateConfig, StudySet } from "@/lib/types";

type Tab = "photo" | "text" | "document" | "url";

const defaults: GenerateConfig = {
  title: "",
  modes: ["quiz", "flashcards", "explanations"],
  category: "Algemeen",
  level: 5,
  language: "Nederlands",
  itemCount: 10,
  focus: "begrippen",
  includeSources: true,
  includeDifficulty: true,
  includeAnswerExplanations: true,
  summarySize: "middellang",
};

function plain(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function fromGenerated(config: GenerateConfig, payload: Record<string, unknown>): StudySet {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: config.title || "Nieuwe StudySnap set",
    status: "concept",
    category: config.category,
    level: config.level,
    language: config.language,
    tags: Array.isArray((payload.analysis as { coreConcepts?: string[] })?.coreConcepts)
      ? ((payload.analysis as { coreConcepts: string[] }).coreConcepts.slice(0, 5))
      : [],
    sourceSummary: typeof payload.sourceSummary === "string" ? payload.sourceSummary : "",
    createdAt: now,
    updatedAt: now,
    quiz: Array.isArray(payload.quiz) ? (payload.quiz as StudySet["quiz"]) : [],
    flashcards: Array.isArray(payload.flashcards) ? (payload.flashcards as StudySet["flashcards"]) : [],
    explanations: Array.isArray(payload.explanations) ? (payload.explanations as StudySet["explanations"]) : [],
    stats: { practiceCount: 0, practiceMinutes: 0, retentionPercentage: 0 },
  };
}

export default function CreatePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tab, setTab] = useState<Tab>("photo");

  const [photo, setPhoto] = useState<File | null>(null);
  const [doc, setDoc] = useState<File | null>(null);
  const [textHtml, setTextHtml] = useState("<p></p>");
  const [speechText, setSpeechText] = useState("");
  const [url, setUrl] = useState("");
  const [urlPreview, setUrlPreview] = useState<{ title: string; description: string } | null>(null);

  const [config, setConfig] = useState<GenerateConfig>(defaults);
  const [generated, setGenerated] = useState<Record<string, unknown> | null>(null);
  const [set, setSet] = useState<StudySet | null>(null);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [dictating, setDictating] = useState(false);

  const inputSummary = useMemo(() => {
    const out = [];
    if (photo) out.push(`Foto: ${photo.name}`);
    if (doc) out.push(`Document: ${doc.name}`);
    if (plain(textHtml)) out.push("Tekst aanwezig");
    if (speechText) out.push("Dictaat aanwezig");
    if (url) out.push(`URL: ${url}`);
    return out.join(" · ") || "Nog geen input";
  }, [doc, photo, speechText, textHtml, url]);

  const previewUrl = async () => {
    setError("");
    try {
      const res = await fetch("/api/preview-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = (await res.json()) as { title?: string; description?: string; error?: string };
      if (!res.ok) throw new Error(json.error || "Preview mislukt");
      setUrlPreview({ title: json.title || "Onbekend", description: json.description || "" });
    } catch (e) {
      setError(String(e));
    }
  };

  const startDictation = () => {
    if (typeof window === "undefined") return;
    const W = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onstart: null | (() => void);
        onend: null | (() => void);
        onerror: null | (() => void);
        onresult: null | ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void);
        start: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onstart: null | (() => void);
        onend: null | (() => void);
        onerror: null | (() => void);
        onresult: null | ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void);
        start: () => void;
      };
    };
    const R = W.webkitSpeechRecognition || W.SpeechRecognition;
    if (!R) { setError("Dictaat niet ondersteund in deze browser."); return; }

    const rec = new R();
    rec.lang = "nl-NL";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onstart = () => setDictating(true);
    rec.onend = () => setDictating(false);
    rec.onerror = () => { setDictating(false); setError("Dictaatfout"); };
    rec.onresult = (event) => {
      const full = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ");
      setSpeechText((prev) => `${prev} ${full}`.trim());
    };
    rec.start();
  };

  const generate = async () => {
    setLoading(true);
    setProgress(5);
    setError("");
    setMessage("");

    const ticker = window.setInterval(() => setProgress((p) => (p >= 90 ? p : p + 5)), 300);

    try {
      const form = new FormData();
      form.append("config", JSON.stringify(config));
      form.append("text", plain(textHtml));
      form.append("speechText", speechText);
      form.append("url", url);
      if (tab === "photo" && photo) form.append("file", photo);
      if (tab === "document" && doc) form.append("file", doc);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as Record<string, unknown> & { error?: string };
      if (!res.ok) throw new Error(json.error || "Generatie mislukt");

      setGenerated(json);
      const studySet = fromGenerated(config, json);
      setSet(studySet);
      upsertSet(studySet);
      setStep(3);
      setMessage("AI output gegenereerd.");
    } catch (e) {
      setError(String(e));
    } finally {
      clearInterval(ticker);
      setProgress(100);
      setLoading(false);
    }
  };

  const refine = async (text: string, instruction: string, apply: (t: string) => void) => {
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, instruction }),
      });
      const json = (await res.json()) as { result?: string; error?: string };
      if (!res.ok) throw new Error(json.error || "Refine mislukt");
      apply(json.result || text);
    } catch (e) {
      setError(String(e));
    }
  };

  const persist = async (status: StudySet["status"]) => {
    if (!set) return;
    const next = { ...set, status, updatedAt: new Date().toISOString() };
    setSet(next);
    upsertSet(next);

    const local = readSets().find((s) => s.id === next.id);
    if (local) {
      const err = await syncSetToSupabase(local);
      setMessage(err ? `Lokaal opgeslagen. Supabase sync fout: ${err}` : "Opgeslagen en gesynchroniseerd met Supabase.");
    }
  };

  return (
    <div className="stack">
      <section className="card">
        <h1>Creation workflow</h1>
        <p className="small muted">Stap 1 Input · Stap 2 Configuratie · Stap 3 Resultaat & bewerking</p>
        <div className="row gap-sm" style={{ marginTop: 10, flexWrap: "wrap" }}>
          {[1, 2, 3].map((n) => (
            <button key={n} className={`btn ${step === n ? "btn-primary" : ""}`} onClick={() => setStep(n as 1 | 2 | 3)}>Stap {n}</button>
          ))}
        </div>
      </section>

      {step === 1 ? (
        <section className="card stack">
          <h2>Stap 1 - Input</h2>
          <div className="row gap-sm" style={{ flexWrap: "wrap" }}>
            {(["photo", "text", "document", "url"] as const).map((t) => (
              <button key={t} className={`btn ${tab === t ? "btn-primary" : ""}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>

          {(tab === "photo" || tab === "document") ? (
            <div className="card" style={{ borderStyle: "dashed", textAlign: "center" }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (!f) return;
              if (tab === "photo") setPhoto(f); else setDoc(f);
            }}>
              <p className="small muted">Drag & drop of kies bestand</p>
              <input type="file" className="input" accept={tab === "photo" ? "image/*" : ".pdf,.doc,.docx,.txt"} capture={tab === "photo" ? "environment" : undefined} onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (tab === "photo") setPhoto(f); else setDoc(f);
              }} />
              {photo ? <p className="small muted">Foto: {photo.name}</p> : null}
              {doc ? <p className="small muted">Document: {doc.name}</p> : null}
            </div>
          ) : null}

          {tab === "text" ? (
            <div className="stack">
              <div className="row gap-sm" style={{ flexWrap: "wrap" }}>
                <button className="btn" onClick={() => document.execCommand("bold")}>Bold</button>
                <button className="btn" onClick={() => document.execCommand("italic")}>Italic</button>
                <button className="btn" onClick={() => document.execCommand("insertUnorderedList")}>Bullets</button>
                <button className="btn" onClick={startDictation}>{dictating ? "Dictaat actief..." : "Start dictaat"}</button>
              </div>
              <div className="card" style={{ minHeight: 170 }} contentEditable suppressContentEditableWarning onInput={(e) => setTextHtml((e.target as HTMLDivElement).innerHTML)} onPaste={(e) => {
                const pasted = e.clipboardData.getData("text");
                if (pasted) setTextHtml((prev) => `${prev}<p>${pasted}</p>`);
              }} />
              <textarea className="input" value={speechText} onChange={(e) => setSpeechText(e.target.value)} placeholder="Dictaat-notities" />
            </div>
          ) : null}

          {tab === "url" ? (
            <div className="stack">
              <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
              <button className="btn" onClick={previewUrl}>URL preview laden</button>
              {urlPreview ? <article className="card"><h3>{urlPreview.title}</h3><p className="small muted">{urlPreview.description}</p></article> : null}
            </div>
          ) : null}

          <p className="small muted">Inputstatus: {inputSummary}</p>
          <button className="btn btn-primary" onClick={() => setStep(2)}>Naar configuratie</button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="card stack">
          <h2>Stap 2 - Configuratie</h2>
          <div className="grid-3">
            <div><label className="label">Titel</label><input className="input" value={config.title} onChange={(e) => setConfig((p) => ({ ...p, title: e.target.value }))} /></div>
            <div><label className="label">Categorie</label><input className="input" value={config.category} onChange={(e) => setConfig((p) => ({ ...p, category: e.target.value }))} /></div>
            <div><label className="label">Taal</label><select className="input" value={config.language} onChange={(e) => setConfig((p) => ({ ...p, language: e.target.value }))}>{["Nederlands", "Engels", "Frans", "Duits", "Spaans"].map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
          </div>

          <div>
            <p className="label">Output type selectie</p>
            <div className="row gap-sm" style={{ flexWrap: "wrap" }}>
              {([
                ["quiz", "Quiz"],
                ["flashcards", "Flashcards"],
                ["explanations", "Uitleg"],
              ] as const).map(([k, label]) => (
                <label key={k} className="small card" style={{ padding: ".5rem .7rem" }}>
                  <input type="checkbox" checked={config.modes.includes(k)} onChange={(e) => setConfig((p) => ({ ...p, modes: e.target.checked ? [...p.modes, k] : p.modes.filter((x) => x !== k) }))} /> {label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid-3">
            <div><label className="label">Niveau ({config.level})</label><input type="range" min={1} max={10} value={config.level} onChange={(e) => setConfig((p) => ({ ...p, level: Number(e.target.value) }))} /></div>
            <div><label className="label">Items ({config.itemCount})</label><input type="range" min={5} max={50} value={config.itemCount} onChange={(e) => setConfig((p) => ({ ...p, itemCount: Number(e.target.value) }))} /></div>
            <div><label className="label">Samenvatting</label><select className="input" value={config.summarySize} onChange={(e) => setConfig((p) => ({ ...p, summarySize: e.target.value as GenerateConfig["summarySize"] }))}><option value="kort">Kort</option><option value="middellang">Middellang</option><option value="uitgebreid">Uitgebreid</option></select></div>
          </div>

          <div className="grid-3">
            <label className="small"><input type="radio" checked={config.focus === "begrippen"} onChange={() => setConfig((p) => ({ ...p, focus: "begrippen" }))} /> Focus op begrippen</label>
            <label className="small"><input type="radio" checked={config.focus === "toepassing"} onChange={() => setConfig((p) => ({ ...p, focus: "toepassing" }))} /> Focus op toepassing</label>
            <label className="small"><input type="checkbox" checked={config.includeSources} onChange={(e) => setConfig((p) => ({ ...p, includeSources: e.target.checked }))} /> Inclusief bronvermelding</label>
            <label className="small"><input type="checkbox" checked={config.includeDifficulty} onChange={(e) => setConfig((p) => ({ ...p, includeDifficulty: e.target.checked }))} /> Moeilijkheidsindicatie per item</label>
            <label className="small"><input type="checkbox" checked={config.includeAnswerExplanations} onChange={(e) => setConfig((p) => ({ ...p, includeAnswerExplanations: e.target.checked }))} /> Uitleg bij elk antwoord</label>
          </div>

          <div className="card small"><b>Voorbeeld instellingen</b><pre>{JSON.stringify(config, null, 2)}</pre></div>

          {loading ? (
            <div>
              <p className="small">Genereren...</p>
              <div style={{ height: 8, background: "#1e293b", borderRadius: 999, overflow: "hidden" }}><div style={{ height: "100%", width: `${progress}%`, background: "#0ea5e9" }} /></div>
            </div>
          ) : null}

          <div className="row gap-sm" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => setStep(1)}>Terug</button>
            <button className="btn btn-primary" onClick={generate} disabled={loading || config.modes.length === 0}>Genereer met AI</button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="card stack">
          <h2>Stap 3 - Resultaat & bewerking</h2>
          {!set ? <p className="small muted">Nog geen output.</p> : (
            <>
              <article className="card small"><b>Bronsamenvatting</b><p>{set.sourceSummary || "-"}</p></article>

              {generated?.analysis ? (
                <article className="card small">
                  <p>Kernconcepten: {((generated.analysis as { coreConcepts?: string[] }).coreConcepts ?? []).join(", ") || "-"}</p>
                  <p>Moeilijkheid: {(generated.analysis as { difficultyEstimate?: string }).difficultyEstimate || "-"}</p>
                  <p>QC: {((generated.analysis as { qualityNotes?: string[] }).qualityNotes ?? []).join(" | ") || "-"}</p>
                </article>
              ) : null}

              <div className="stack">
                <h3>Quiz preview (inline edit + reorder)</h3>
                {set.quiz.map((q, i) => (
                  <article
                    key={q.id}
                    className="card"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("from", String(i))}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const from = Number(e.dataTransfer.getData("from"));
                      const to = i;
                      if (Number.isNaN(from) || from === to) return;
                      const quiz = [...set.quiz];
                      const [mv] = quiz.splice(from, 1);
                      quiz.splice(to, 0, mv);
                      setSet({ ...set, quiz, updatedAt: new Date().toISOString() });
                    }}
                  >
                    <textarea className="input" value={q.question} onChange={(e) => setSet({ ...set, quiz: set.quiz.map((x) => x.id === q.id ? { ...x, question: e.target.value } : x) })} />
                    <textarea className="input" value={q.answer} onChange={(e) => setSet({ ...set, quiz: set.quiz.map((x) => x.id === q.id ? { ...x, answer: e.target.value } : x) })} style={{ marginTop: 8 }} />
                    <div className="row gap-sm" style={{ marginTop: 8, flexWrap: "wrap" }}>
                      <button className="btn" onClick={() => void refine(q.question, "Maak deze vraag moeilijker", (v) => setSet({ ...set, quiz: set.quiz.map((x) => x.id === q.id ? { ...x, question: v } : x) }))}>Maak moeilijker</button>
                      <button className="btn" onClick={() => void refine(q.explanation || q.answer, "Vereenvoudig uitleg", (v) => setSet({ ...set, quiz: set.quiz.map((x) => x.id === q.id ? { ...x, explanation: v } : x) }))}>Vereenvoudig uitleg</button>
                      <button className="btn" onClick={() => setSet({ ...set, quiz: set.quiz.filter((x) => x.id !== q.id) })}>Verwijder</button>
                    </div>
                  </article>
                ))}
                <button className="btn" onClick={() => setSet({ ...set, quiz: [...set.quiz, { id: crypto.randomUUID(), type: "open", question: "Nieuwe vraag", answer: "Modelantwoord" }] })}>Vraag toevoegen</button>
              </div>

              <div className="stack">
                <h3>Flashcards</h3>
                {set.flashcards.map((f) => (
                  <article key={f.id} className="card">
                    <input className="input" value={f.front} onChange={(e) => setSet({ ...set, flashcards: set.flashcards.map((x) => x.id === f.id ? { ...x, front: e.target.value } : x) })} />
                    <input className="input" style={{ marginTop: 8 }} value={f.back} onChange={(e) => setSet({ ...set, flashcards: set.flashcards.map((x) => x.id === f.id ? { ...x, back: e.target.value } : x) })} />
                  </article>
                ))}
              </div>

              <div className="stack">
                <h3>Uitleg</h3>
                {set.explanations.map((x) => (
                  <article key={x.id} className="card">
                    <input className="input" value={x.title} onChange={(e) => setSet({ ...set, explanations: set.explanations.map((k) => k.id === x.id ? { ...k, title: e.target.value } : k) })} />
                    <textarea className="input" style={{ marginTop: 8 }} value={x.content} onChange={(e) => setSet({ ...set, explanations: set.explanations.map((k) => k.id === x.id ? { ...k, content: e.target.value } : k) })} />
                  </article>
                ))}
              </div>

              <div>
                <label className="label">Tags (comma separated)</label>
                <input className="input" value={set.tags.join(", ")} onChange={(e) => setSet({ ...set, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
              </div>

              <div className="row gap-sm" style={{ flexWrap: "wrap" }}>
                <button className="btn" onClick={() => void persist("concept")}>Opslaan als concept</button>
                <button className="btn btn-primary" onClick={() => void persist("published")}>Publiceren</button>
                <button className="btn" onClick={() => exportToJson(set)}>Export JSON</button>
                <button className="btn" onClick={() => exportToCsv(set)}>Export CSV</button>
                <button className="btn" onClick={() => window.print()}>Export PDF/print</button>
              </div>
            </>
          )}
        </section>
      ) : null}

      {error ? <section className="card small" style={{ borderColor: "#be123c", color: "#fecdd3" }}>{error}</section> : null}
      {message ? <section className="card small" style={{ borderColor: "#047857", color: "#a7f3d0" }}>{message}</section> : null}
    </div>
  );
}
