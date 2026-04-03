import { NextResponse } from "next/server";

const MODEL = "qwen/qwen3.6-plus:free";

function key(req: Request) {
  return process.env.OPENROUTER_API_KEY || req.headers.get("x-openrouter-api-key")?.trim() || "";
}

export async function POST(req: Request) {
  try {
    const k = key(req);
    if (!k) return NextResponse.json({ error: "OPENROUTER_API_KEY ontbreekt" }, { status: 400 });

    const body = (await req.json()) as { text?: string; instruction?: string };
    if (!body.text || !body.instruction) return NextResponse.json({ error: "text/instruction verplicht" }, { status: 400 });

    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${k}`,
        Referer: "https://studysnap.local",
        "X-Title": "StudySnap AI",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Geef alleen JSON: {\"result\":\"...\"}" },
          { role: "user", content: `Instructie: ${body.instruction}\n\nTekst:\n${body.text}` },
        ],
      }),
    });

    if (!r.ok) return NextResponse.json({ error: await r.text() }, { status: 500 });
    const json = (await r.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content) as { result?: string };
    return NextResponse.json({ result: parsed.result || body.text });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
