import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PY_SERVICE_URL = process.env.PY_SERVICE_URL || "http://127.0.0.1:8000";

export async function POST(request) {
  try {
    const form = await request.formData();
    const companyId = (form.get("companyId") || "default").toString();

    const fwd = new FormData();
    fwd.set("companyId", companyId);

    const res = await fetch(`${PY_SERVICE_URL}/session`, {
      method: "POST",
      body: fwd,
    });

    const text = await res.text();
    if (!res.ok) return new NextResponse(text, { status: res.status });

    return NextResponse.json(JSON.parse(text));
  } catch (e) {
    return new NextResponse(e?.stack || e?.message || String(e), { status: 500 });
  }
}

