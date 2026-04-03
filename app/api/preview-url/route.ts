import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { url?: string };
    const raw = body.url?.trim();
    if (!raw) return NextResponse.json({ error: "URL ontbreekt" }, { status: 400 });

    const u = new URL(raw);
    if (!["http:", "https:"].includes(u.protocol)) return NextResponse.json({ error: "Alleen http/https" }, { status: 400 });
    const title = u.hostname;
    const description = `Pad: ${u.pathname || "/"}${u.search || ""}`;
    return NextResponse.json({ title, description });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
