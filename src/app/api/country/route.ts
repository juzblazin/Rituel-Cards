import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { code?: string } | null;
  const code = body?.code && /^[A-Z]{2}$/.test(body.code) ? body.code : "ALL";

  const response = new Response(JSON.stringify({ code }), {
    headers: { "Content-Type": "application/json" },
  });
  response.headers.append(
    "Set-Cookie",
    `cr_country=${code}; Path=/; Max-Age=31536000; SameSite=Lax`,
  );
  return response;
}
