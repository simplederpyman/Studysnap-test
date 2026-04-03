"use client";

import { useState } from "react";
import { getSupabaseSettings, saveSupabaseSettings } from "@/lib/supabase";
import { openRouterKeyStore } from "@/lib/runtime-secrets";

export default function SettingsPage() {
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseSettings().url);
  const [supabaseAnon, setSupabaseAnon] = useState(() => getSupabaseSettings().anonKey);
  const [openRouterKey, setOpenRouterKey] = useState(() => openRouterKeyStore.value);
  const [message, setMessage] = useState("");

  const MESSAGE_DISPLAY_DURATION = 3000;

  const save = () => {
    saveSupabaseSettings(supabaseUrl, supabaseAnon);
    openRouterKeyStore.value = openRouterKey.trim();
    setMessage("Instellingen opgeslagen.");
    setTimeout(() => setMessage(""), MESSAGE_DISPLAY_DURATION);
  };

  return (
    <div className="stack">
      <div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>⚙️ Instellingen</h1>
        <p className="muted small">Beheer je API keys en integraties.</p>
      </div>

      <div className="grid-2">
        {/* API Keys */}
        <section className="card stack">
          <h2 style={{ fontWeight: 700, marginBottom: ".25rem" }}>🔑 API Keys</h2>
          <p className="small muted">Voer je API keys in om de AI-functionaliteit te activeren.</p>
          <hr className="divider" />
          <div>
            <label className="label">OpenRouter API Key</label>
            <input
              className="input"
              type="password"
              value={openRouterKey}
              onChange={(e) => setOpenRouterKey(e.target.value)}
              placeholder="sk-or-v1-..."
            />
            <p className="small muted" style={{ marginTop: ".4rem" }}>
              Haal je gratis key op via{" "}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
                openrouter.ai/keys
              </a>
            </p>
          </div>
          <div>
            <label className="label">Supabase URL</label>
            <input
              className="input"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xxx.supabase.co"
            />
          </div>
          <div>
            <label className="label">Supabase Anon Key</label>
            <input
              className="input"
              type="password"
              value={supabaseAnon}
              onChange={(e) => setSupabaseAnon(e.target.value)}
              placeholder="eyJ..."
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="btn btn-primary" onClick={save}>💾 Opslaan</button>
            {message && (
              <span className="small" style={{ color: "#6ee7b7" }}>✓ {message}</span>
            )}
          </div>
        </section>

        {/* Env guide */}
        <section className="card">
          <h2 style={{ fontWeight: 700, marginBottom: ".25rem" }}>📄 .env.local</h2>
          <p className="small muted" style={{ marginBottom: "1rem" }}>
            Voor productie-gebruik kun je ook environment variables gebruiken.
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
    </div>
  );
}
