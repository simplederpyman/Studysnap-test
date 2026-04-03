import { NextResponse } from "next/server";
import type { GenerateConfig } from "@/lib/types";

export const runtime = "nodejs";

const MODEL = "qwen/qwen3.6-plus:free";
const VISION_MODEL = "qwen/qwen3.6-plus:free";

function key(req: Request) {
  return process.env.OPENROUTER_API_KEY || req.headers.get("x-openrouter-api-key")?.trim() || "";
}

async function chat(apiKey: string, payload: unknown) {
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      Referer: "https://studysnap.local",
      "X-Title": "StudySnap AI",
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`OpenRouter ${r.status}: ${await r.text()}`);
  const j = (await r.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const c = j.choices?.[0]?.message?.content;
  if (!c) throw new Error("Lege model response");
  return JSON.parse(c) as Record<string, unknown>;
}

async function extractUrl(raw: string) {
  const u = new URL(raw);
  if (!["http:", "https:"].includes(u.protocol)) throw new Error("Alleen http/https URL's");
  return `URL bron: ${u.toString()}`;
}

async function extractFile(file: File, apiKey: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type.startsWith("image/") || /\.(png|jpg|jpeg|webp)$/i.test(name)) {
    const url = `data:${file.type};base64,${buffer.toString("base64")}`;
    const ocr = await chat(apiKey, {
      model: VISION_MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Geef alleen JSON: {\"text\":\"...\"}" },
        { role: "user", content: [{ type: "text", text: "Extraheer alle tekst" }, { type: "image_url", image_url: { url } }] },
      ],
    });
    return typeof ocr.text === "string" ? ocr.text : "";
  }

  if (type.includes("pdf") || name.endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    return parsed.text || "";
  }

  if (type.includes("word") || type.includes("officedocument") || name.endsWith(".doc") || name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const out = await mammoth.extractRawText({ buffer });
    return out.value || "";
  }

  if (type.includes("text") || name.endsWith(".txt") || name.endsWith(".md")) return buffer.toString("utf-8");
  return "";
}

function prompt(source: string, config: GenerateConfig) {
  return `
Maak output in ${config.language}.

Voer de pipeline uit:
1. content analyse
2. kernconcepten
3. moeilijkheidsgraad
4. gekozen output generatie
5. kwaliteitscontrole
6. bewerkbaar formaat

Config:
${JSON.stringify(config, null, 2)}

Geef ALLEEN JSON met dit schema:
{
  "analysis": {"coreConcepts":[""],"difficultyEstimate":"basis|gemiddeld|gevorderd","qualityNotes":["..."]},
  "quiz": [{"id":"...","type":"multiple_choice|open|true_false|matching|fill_blank|scenario","question":"...","options":["A","B","C","D"],"answer":"...","explanation":"..."}],
  "flashcards": [{"id":"...","type":"term_definition|question_answer|concept_example|image_description","front":"...","back":"...","reversible":true}],
  "explanations": [{"id":"...","format":"summary|concept|steps|mindmap|comparison|examples","title":"...","content":"..."}],
  "sourceSummary": "..."
}

Bron:
${source.slice(0, 24000)}
`;
}

export async function POST(req: Request) {
  try {
    const apiKey = key(req);
    if (!apiKey) return NextResponse.json({ error: "OPENROUTER_API_KEY ontbreekt" }, { status: 400 });

    const form = await req.formData();
    const configRaw = form.get("config");
    if (!configRaw || typeof configRaw !== "string") return NextResponse.json({ error: "config ontbreekt" }, { status: 400 });
    const config = JSON.parse(configRaw) as GenerateConfig;

    const text = String(form.get("text") ?? "").trim();
    const speechText = String(form.get("speechText") ?? "").trim();
    const url = String(form.get("url") ?? "").trim();
    const file = form.get("file");

    const chunks: string[] = [];
    if (text) chunks.push(text);
    if (speechText) chunks.push(`Dictaat: ${speechText}`);
    if (url) chunks.push(await extractUrl(url));
    if (file instanceof File) {
      const content = await extractFile(file, apiKey);
      if (content) chunks.push(content);
    }

    const source = chunks.join("\n\n---\n\n").trim();
    if (!source) return NextResponse.json({ error: "Geen input gevonden" }, { status: 400 });

    const out = await chat(apiKey, {
      model: MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Je bent StudySnap AI. Geef alleen valide JSON." },
        { role: "user", content: prompt(source, config) },
      ],
    });

    return NextResponse.json(out);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
