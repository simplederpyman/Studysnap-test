"use client";

import { useMemo, useState } from "react";
import { readSets } from "@/lib/storage";

export default function QuizModePage() {
  const [sets, setSets] = useState(readSets());
  const [setIndex, setSetIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(true);
  const [timed, setTimed] = useState(false);

  const set = sets[setIndex];
  const quiz = set?.quiz ?? [];
  const question = quiz[questionIndex];

  const review = useMemo(() => quiz.map((q) => {
    const given = answers[q.id] ?? "";
    const correct = q.answer.toLowerCase().trim() === given.toLowerCase().trim();
    return { q, given, correct };
  }), [answers, quiz]);

  const score = useMemo(() => review.length ? Math.round((review.filter((x) => x.correct).length / review.length) * 100) : 0, [review]);

  const submit = () => {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: answer }));
    setAnswer("");
    if (questionIndex + 1 < quiz.length) setQuestionIndex((i) => i + 1);
  };

  const wrongOnly = review.filter((r) => !r.correct).map((r) => r.q);

  return (
    <div className="stack">
      <section className="card">
        <h1>Quiz Mode</h1>
        <p className="small muted">Timed of zonder tijdlimiet, directe feedback, review en oefen-fouten optie.</p>
      </section>

      <section className="card grid-3">
        <div>
          <label className="label">Set</label>
          <select className="input" value={setIndex} onChange={(e) => { setSetIndex(Number(e.target.value)); setQuestionIndex(0); setAnswers({}); }}>
            {sets.map((s, i) => <option key={s.id} value={i}>{s.title}</option>)}
          </select>
        </div>
        <label className="small"><input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} /> Timed</label>
        <label className="small"><input type="checkbox" checked={showFeedback} onChange={(e) => setShowFeedback(e.target.checked)} /> Directe feedback</label>
      </section>

      {!question ? <section className="card small muted">Geen quizvragen beschikbaar.</section> : (
        <section className="card">
          <p className="small muted">Vraag {questionIndex + 1} / {quiz.length} {timed ? "· timed" : ""}</p>
          <h2>{question.question}</h2>
          {question.options?.length ? (
            <ul>
              {question.options.map((o) => <li key={o} className="small">{o}</li>)}
            </ul>
          ) : null}
          <textarea className="input" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Jouw antwoord" />
          <div className="row gap-sm" style={{ marginTop: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={submit}>Bevestig</button>
            {showFeedback && answers[question.id] ? <div className="small">Correct: <b>{question.answer}</b></div> : null}
          </div>
        </section>
      )}

      <section className="card">
        <h2>Review</h2>
        <p className="small muted">Score: {score}%</p>
        {review.map((r) => (
          <article key={r.q.id} className="card" style={{ marginTop: 8 }}>
            <p><b>{r.q.question}</b></p>
            <p className="small muted">Jij: {r.given || "-"}</p>
            <p className="small" style={{ color: r.correct ? "#6ee7b7" : "#fda4af" }}>Correct: {r.q.answer}</p>
          </article>
        ))}
        {wrongOnly.length > 0 ? (
          <button className="btn" style={{ marginTop: 8 }} onClick={() => {
            const next = [...sets];
            next[setIndex].quiz = wrongOnly;
            setSets(next);
            setQuestionIndex(0);
            setAnswers({});
          }}>Oefen alleen fouten</button>
        ) : null}
      </section>
    </div>
  );
}
