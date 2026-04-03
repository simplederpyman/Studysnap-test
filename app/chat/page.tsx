"use client";

import { useEffect, useRef, useState } from "react";
import { openRouterKeyStore } from "@/lib/runtime-secrets";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
}

const STARTERS = [
  "Leg me het verschil uit tussen mitose en meiose.",
  "Maak 5 flashcards over de Franse Revolutie.",
  "Wat is de stelling van Pythagoras?",
  "Samenvatting van de industriële revolutie.",
];

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hoi! Ik ben je StudySnap AI-assistent 👋\n\nIk kan je helpen met:\n• Uitleg van moeilijke concepten\n• Flashcards en quizvragen maken\n• Samenvattingen van je studiemateriaal\n• Antwoorden op studievragen\n\nWaar kan ik je mee helpen?",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const apiKey = openRouterKeyStore.value;
      if (!apiKey) {
        throw new Error("Geen OpenRouter API key ingesteld. Ga naar Settings om je key in te voeren.");
      }

      const history = [...messages, userMsg]
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          Referer: "https://studysnap.local",
          "X-Title": "StudySnap AI",
        },
        body: JSON.stringify({
          model: "qwen/qwen3.6-plus:free",
          messages: [
            {
              role: "system",
              content:
                "Je bent StudySnap AI, een slimme studieassistent die studenten helpt leren. Je antwoorden zijn duidelijk, beknopt en educatief. Je geeft voorbeelden waar nuttig. Antwoord altijd in de taal van de gebruiker (standaard Nederlands).",
            },
            ...history,
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message ?? `API fout: ${res.status}`);
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content ?? "Geen antwoord ontvangen.";

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: reply, ts: Date.now() },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is een fout opgetreden.");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Chat gewist. Waarmee kan ik je helpen?",
        ts: Date.now(),
      },
    ]);
    setError("");
  };

  return (
    <div className="chat-layout">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: "1rem" }}>
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 40, height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.2rem",
            }}
          >
            🧠
          </div>
          <div>
            <h1 style={{ fontSize: "1.2rem", fontWeight: 700 }}>StudySnap AI Chat</h1>
            <p className="small muted">Jouw persoonlijke AI-studieassistent</p>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={clearChat} title="Chat wissen">
          🗑️ Wissen
        </button>
      </div>

      {/* Messages */}
      <div
        className="card"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.1) transparent",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-bubble${msg.role === "user" ? " user" : ""}`}
          >
            <div className={`chat-avatar${msg.role === "assistant" ? " ai" : ""}`}>
              {msg.role === "assistant" ? "🧠" : "👤"}
            </div>
            <div>
              <div className="chat-msg" style={{ whiteSpace: "pre-wrap" }}>
                {msg.content}
              </div>
              <div className="small muted" style={{ marginTop: ".3rem", textAlign: msg.role === "user" ? "right" : "left" }}>
                {formatTime(msg.ts)}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-bubble">
            <div className="chat-avatar ai">🧠</div>
            <div className="chat-msg" style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
              <span style={{ animation: "pulse 1.4s ease-in-out infinite", opacity: .7 }}>●</span>
              <span style={{ animation: "pulse 1.4s ease-in-out infinite .2s", opacity: .7 }}>●</span>
              <span style={{ animation: "pulse 1.4s ease-in-out infinite .4s", opacity: .7 }}>●</span>
            </div>
          </div>
        )}

        {error && (
          <div
            className="card card-sm"
            style={{ borderColor: "rgba(248,113,113,0.3)", background: "rgba(239,68,68,0.08)", color: "#fca5a5" }}
          >
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Starter prompts */}
      {messages.length <= 1 && (
        <div className="flex gap-2 wrap" style={{ margin: ".75rem 0" }}>
          {STARTERS.map((s) => (
            <button
              key={s}
              className="btn btn-ghost"
              style={{ fontSize: ".8rem", padding: ".4rem .75rem", textAlign: "left" }}
              onClick={() => send(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chat-input-row">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); autoResize(); }}
          onKeyDown={onKeyDown}
          placeholder="Stel een vraag... (Enter om te verzenden, Shift+Enter voor nieuwe regel)"
          rows={1}
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          style={{ padding: ".55rem .9rem", flexShrink: 0 }}
          onClick={() => send()}
          disabled={loading || !input.trim()}
        >
          ↑
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: .3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
