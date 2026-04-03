"use client";

export default function SettingsPage() {
  return (
    <div className="stack">
      <div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>⚙️ Instellingen</h1>
        <p className="muted small">Applicatie-instellingen worden beheerd via omgevingsvariabelen.</p>
      </div>

      <section className="card">
        <h2 style={{ fontWeight: 700, marginBottom: ".25rem" }}>📄 Omgevingsvariabelen</h2>
        <p className="small muted" style={{ marginBottom: "1rem" }}>
          Configureer de applicatie via een <code>.env.local</code> bestand of je hosting-omgeving.
        </p>
        <div
          style={{
            background: "rgba(0,0,0,0.4)",
            border: "1px solid var(--glass-border)",
            borderRadius: ".75rem",
            padding: "1rem",
            fontFamily: "ui-monospace, monospace",
            fontSize: ".82rem",
            color: "#a5f3fc",
            lineHeight: 1.8,
          }}
        >
          <div style={{ color: "#6ee7b7" }}># OpenRouter</div>
          <div>OPENROUTER_API_KEY=sk-or-v1-xxx</div>
          <br />
          <div style={{ color: "#6ee7b7" }}># Supabase</div>
          <div>NEXT_PUBLIC_SUPABASE_URL=https://...</div>
          <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...</div>
        </div>
      </section>
    </div>
  );
}
