import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const COUNTRY = /^[A-Z]{2}$/;

export function middleware(request: NextRequest) {
  const cookieCountry = request.cookies.get("cr_country")?.value;
  const detected =
    cookieCountry ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    "ALL";
  const country = COUNTRY.test(detected) && !["XX", "T1"].includes(detected) ? detected : "ALL";

  const headers = new Headers(request.headers);
  headers.set("x-geo-country", country);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
