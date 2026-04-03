import Link from "next/link";

const features = [
  { icon: "📸", title: "Foto's & Documenten", desc: "Upload foto's, PDF's en Word-bestanden. AI extraheert automatisch de leerstof." },
  { icon: "🧠", title: "AI-quizzen", desc: "MCQ, open vragen, waar/onwaar, matching, fill-in en scenario-gebaseerde vragen." },
  { icon: "🃏", title: "Smart Flashcards", desc: "Term-definitie, vraag-antwoord, concept-voorbeeld met spaced repetition." },
  { icon: "📝", title: "Instant Uitleg", desc: "Samenvatting, stappen, mindmap, vergelijking en praktijkvoorbeelden." },
  { icon: "💬", title: "AI Chat", desc: "Stel vragen over je studiemateriaal alsof je met een persoonlijke tutor praat." },
  { icon: "📊", title: "Voortgang bijhouden", desc: "Gedetailleerde statistieken, retentie scores en gepersonaliseerde aanbevelingen." },
];

const steps = [
  { n: "1", title: "Upload", desc: "Foto, tekst, document, URL of dictaat" },
  { n: "2", title: "Configureer", desc: "Kies type, niveau, taal en aantal items" },
  { n: "3", title: "Studeer", desc: "Bewerk, exporteer en oefen met study modes" },
];

const testimonials = [
  { quote: "Ik maak in minuten complete oefensets uit mijn college-notities.", author: "Student, TU Delft" },
  { quote: "Docenten besparen uren voorbereiding met automatische quizgeneratie.", author: "Docent, Hogeschool" },
  { quote: "De combinatie van flashcards + AI-chat werkt top voor tentamens.", author: "Student, UvA" },
];

export default function Home() {
  return (
    <div className="stack" style={{ gap: "3rem" }}>
      {/* Hero */}
      <section className="hero hero-wrap">
        <div className="glow-orb" style={{ width: 400, height: 400, background: "rgba(99,102,241,0.4)", top: -100, left: "10%" }} />
        <div className="glow-orb" style={{ width: 300, height: 300, background: "rgba(168,85,247,0.35)", bottom: -60, right: "15%" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <span className="badge" style={{ marginBottom: "1.25rem", display: "inline-block" }}>✨ AI-gestuurd leerplatform</span>
          <h1>
            Van foto naar{" "}
            <span className="gradient-text">flashcards</span>
            <br />in 30 seconden
          </h1>
          <p className="hero-sub">
            Upload foto&apos;s, documenten, URL&apos;s of tekst en genereer direct
            quizzen, flashcards en uitleg met geavanceerde AI.
          </p>
          <div className="hero-actions">
            <Link href="/create" className="btn btn-primary" style={{ padding: ".7rem 1.8rem", fontSize: "1rem" }}>
              ✨ Gratis starten
            </Link>
            <Link href="/chat" className="btn" style={{ padding: ".7rem 1.4rem", fontSize: "1rem" }}>
              💬 AI Chat proberen
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid-3">
        {[
          { n: "30s", label: "Gemiddelde generatietijd" },
          { n: "6+", label: "Vraagtypen ondersteund" },
          { n: "100%", label: "Lokaal & privé" },
        ].map(({ n, label }) => (
          <div key={label} className="stat-card">
            <div className="stat-number">{n}</div>
            <div className="small muted" style={{ marginTop: ".35rem" }}>{label}</div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section>
        <h2 style={{ marginBottom: "1.25rem", fontSize: "1.5rem", fontWeight: 700 }}>Hoe werkt het?</h2>
        <div className="grid-3">
          {steps.map(({ n, title, desc }) => (
            <div key={n} className="feature-card">
              <div className="feature-icon" style={{ background: "rgba(99,102,241,0.15)", borderColor: "rgba(99,102,241,0.3)" }}>
                <span style={{ fontWeight: 800, color: "var(--accent)", fontSize: "1.1rem" }}>{n}</span>
              </div>
              <h3 style={{ marginBottom: ".35rem" }}>{title}</h3>
              <p className="small muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 style={{ marginBottom: "1.25rem", fontSize: "1.5rem", fontWeight: 700 }}>Alles voor slim studeren</h2>
        <div className="grid-3">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="feature-card">
              <div className="feature-icon">{icon}</div>
              <h3 style={{ marginBottom: ".35rem" }}>{title}</h3>
              <p className="small muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <h2 style={{ marginBottom: "1.25rem", fontSize: "1.5rem", fontWeight: 700 }}>Wat gebruikers zeggen</h2>
        <div className="grid-3">
          {testimonials.map(({ quote, author }) => (
            <div key={author} className="card">
              <div style={{ fontSize: "1.8rem", marginBottom: ".5rem", opacity: 0.6 }}>&ldquo;</div>
              <p className="small" style={{ lineHeight: 1.7 }}>{quote}</p>
              <p className="small muted" style={{ marginTop: ".75rem", fontWeight: 600 }}>— {author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="card text-center" style={{ padding: "3rem 2rem" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: ".75rem" }}>
          Klaar om slimmer te studeren?
        </h2>
        <p className="muted" style={{ marginBottom: "1.5rem" }}>
          Start gratis – geen account vereist, volledig privé.
        </p>
        <div className="hero-actions">
          <Link href="/create" className="btn btn-primary" style={{ padding: ".7rem 1.8rem", fontSize: "1rem" }}>
            ✨ Maak je eerste set
          </Link>
          <Link href="/settings" className="btn" style={{ padding: ".7rem 1.4rem", fontSize: "1rem" }}>
            ⚙️ API keys instellen
          </Link>
        </div>
      </section>
    </div>
  );
}
