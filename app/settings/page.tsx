"use client";

import { useState } from "react";
import { getSupabaseSettings, saveSupabaseSettings } from "@/lib/supabase";
import { openRouterKeyStore } from "@/lib/runtime-secrets";

export default function SettingsPage() {
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseSettings().url);
  const [supabaseAnon, setSupabaseAnon] = useState(() => getSupabaseSettings().anonKey);
  const [openRouterKey, setOpenRouterKey] = useState(() => openRouterKeyStore.value);
  const [message, setMessage] = useState("");

  const save = () => {
    saveSupabaseSettings(supabaseUrl, supabaseAnon);
    openRouterKeyStore.value = openRouterKey.trim();
    setMessage("Instellingen opgeslagen.");
  };

  return (
    <div className="stack">
      <section className="card">
        <h1>Integraties & API keys</h1>
        <p className="small muted">Plek om je Supabase en OpenRouter API key in te voeren.</p>
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
          <label className="label">OpenRouter API key</label>
          <input className="input" value={openRouterKey} onChange={(e) => setOpenRouterKey(e.target.value)} placeholder="sk-or-v1-..." />
        </div>
        <button className="btn btn-primary" onClick={save}>Opslaan</button>
        {message ? <p className="small" style={{ color: "#6ee7b7" }}>{message}</p> : null}
      </section>

      <section className="card small">
        <b>Aanbevolen .env.local</b>
        <pre>{`OPENROUTER_API_KEY=sk-or-v1-xxx
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`}</pre>
      </section>
    </div>
  );
}
