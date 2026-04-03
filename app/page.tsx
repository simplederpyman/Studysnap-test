import Link from "next/link";

export default function Home() {
  return (
    <div className="stack">
      <section className="card">
        <p className="small" style={{ color: "#38bdf8", fontWeight: 700 }}>StudySnap AI</p>
        <h1 style={{ marginTop: 6, fontSize: "2.2rem" }}>Van foto naar flashcards in 30 seconden</h1>
        <p className="muted">
          Upload foto’s, documenten, URL’s of tekst en genereer direct quizzen, flashcards en uitleg met AI.
        </p>
        <div className="row gap-sm" style={{ marginTop: 14, flexWrap: "wrap" }}>
          <Link href="/create" className="btn btn-primary">Gratis starten</Link>
          <Link href="/settings" className="btn">Premium / API keys</Link>
        </div>
      </section>

      <section className="grid-3">
        {[
          ["1. Upload", "Foto, tekst, document, URL of dictaat"],
          ["2. Configureer", "Kies type, niveau, taal en aantal items"],
          ["3. Studeer", "Bewerk, exporteer en oefen met study modes"],
        ].map(([t, d]) => (
          <article key={t} className="card"><h3>{t}</h3><p className="muted small">{d}</p></article>
        ))}
      </section>

      <section className="grid-3">
        {[
          ["AI-quizzen", "MCQ, open vragen, waar/onwaar, matching, fill-in en scenario"],
          ["Smart flashcards", "Term-definitie, vraag-antwoord, concept-voorbeeld"],
          ["Instant uitleg", "Samenvatting, stappen, mindmap, vergelijking en voorbeelden"],
        ].map(([t, d]) => (
          <article key={t} className="card"><h3 style={{ color: "#7dd3fc" }}>{t}</h3><p className="muted small">{d}</p></article>
        ))}
      </section>

      <section className="card">
        <h2>Testimonials</h2>
        <div className="grid-3">
          <blockquote className="card small">“Ik maak in minuten complete oefensets uit mijn college-notities.”</blockquote>
          <blockquote className="card small">“Docenten besparen uren voorbereiding met automatische quizgeneratie.”</blockquote>
          <blockquote className="card small">“De combinatie van flashcards + uitleg werkt top voor tentamens.”</blockquote>
        </div>
      </section>
    </div>
  );
}
