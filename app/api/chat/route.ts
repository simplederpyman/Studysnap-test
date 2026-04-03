import { NextResponse } from "next/server";

const MODEL = "qwen/qwen3.6-plus:free";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY ?? "";
    if (!apiKey) return NextResponse.json({ error: "OPENROUTER_API_KEY ontbreekt" }, { status: 500 });

    const body = (await req.json()) as { messages?: Array<{ role: string; content: string }> };
    if (!Array.isArray(body.messages)) return NextResponse.json({ error: "messages verplicht" }, { status: 400 });

    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        Referer: "https://studysnap.local",
        "X-Title": "StudySnap AI",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: body.messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!r.ok) {
      const data = (await r.json().catch(() => ({}))) as { error?: { message?: string } };
      return NextResponse.json({ error: data?.error?.message ?? `API fout: ${r.status}` }, { status: 500 });
    }

    const data = (await r.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const reply = data.choices?.[0]?.message?.content ?? "Geen antwoord ontvangen.";
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
