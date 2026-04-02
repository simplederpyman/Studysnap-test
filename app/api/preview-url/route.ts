import { NextResponse } from "next/server";

function strip(html: string) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { url?: string };
    const raw = body.url?.trim();
    if (!raw) return NextResponse.json({ error: "URL ontbreekt" }, { status: 400 });

    const u = new URL(raw);
    if (!["http:", "https:"].includes(u.protocol)) return NextResponse.json({ error: "Alleen http/https" }, { status: 400 });

    const res = await fetch(u.toString(), { cache: "no-store", headers: { "User-Agent": "StudySnapAI/1.0" } });
    if (!res.ok) return NextResponse.json({ error: "Kon URL niet ophalen" }, { status: 400 });
    const html = await res.text();

    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || u.hostname;
    const description = strip(html).slice(0, 280);
    return NextResponse.json({ title, description });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
