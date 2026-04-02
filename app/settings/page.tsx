"use client";

import { useEffect, useState } from "react";
import { getSupabaseSettings, saveSupabaseSettings } from "@/lib/supabase";

const GROQ_KEY_STORAGE = "studysnap_groq_api_key";

export default function SettingsPage() {
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnon, setSupabaseAnon] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const s = getSupabaseSettings();
    setSupabaseUrl(s.url);
    setSupabaseAnon(s.anonKey);
    setGroqKey(window.localStorage.getItem(GROQ_KEY_STORAGE) ?? "");
  }, []);

  const save = () => {
    saveSupabaseSettings(supabaseUrl, supabaseAnon);
    window.localStorage.setItem(GROQ_KEY_STORAGE, groqKey.trim());
    setMessage("Instellingen opgeslagen.");
  };

  return (
    <div className="stack">
      <section className="card">
        <h1>Integraties & API keys</h1>
        <p className="small muted">Plek om je Supabase en Groq API key in te voeren.</p>
      </section>

      <section className="card stack">
        <div>
          <label className="label">Supabase URL</label>
          <input className="input" value={supabaseUrl} onChange={(e) => setSupabaseUrl(e.target.value)} placeholder="https://xxx.supabase.co" />
        </div>
        <div>
          <label className="label">Supabase anon key</label>
          <input className="input" value={supabaseAnon} onChange={(e) => setSupabaseAnon(e.target.value)} placeholder="eyJ..." />
        </div>
        <div>
          <label className="label">Groq API key</label>
          <input className="input" value={groqKey} onChange={(e) => setGroqKey(e.target.value)} placeholder="gsk_..." />
        </div>
        <button className="btn btn-primary" onClick={save}>Opslaan</button>
        {message ? <p className="small" style={{ color: "#6ee7b7" }}>{message}</p> : null}
      </section>

      <section className="card small">
        <b>Aanbevolen .env.local</b>
        <pre>{`GROQ_API_KEY=gsk_xxx
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`}</pre>
      </section>
    </div>
  );
}
