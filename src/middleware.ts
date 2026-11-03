import { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const COUNTRY = /^[A-Z]{2}$/;

const intlMiddleware = createMiddleware(routing);

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

  // next-intl forwards these request headers on its rewrite/next responses.
  return intlMiddleware(new NextRequest(request, { headers }));
}

export const config = {
  matcher: ["/((?!api/|go/|_next|_vercel|sitemaps/|favicon.ico|.*\\..*).*)"],
};
