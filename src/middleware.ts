import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const COUNTRY = /^[A-Z]{2}$/;
const CANONICAL_HOST = "rituel.xyz";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  let redirectNeeded = false;

  // http:// and www.rituel.xyz are crawlable alternates — consolidate on
  // https://rituel.xyz with a permanent redirect instead of relying on the
  // canonical tag alone.
  // `host` is a forbidden header and may be stripped before the middleware
  // Request is built; x-forwarded-host is the reliable proxy-set value.
  const host = (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    url.hostname
  ).split(",")[0].trim().split(":")[0].toLowerCase();
  if (host === CANONICAL_HOST || host === `www.${CANONICAL_HOST}`) {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const insecure = forwardedProto ? forwardedProto === "http" : url.protocol === "http:";
    if (insecure || host !== CANONICAL_HOST) {
      url.protocol = "https:";
      url.hostname = CANONICAL_HOST;
      url.port = "";
      redirectNeeded = true;
    }
  }

  // /countries/<slug>?country=XX duplicates the path — the directory's fixed
  // country filter already encodes it, so the parameter is redundant.
  if (url.pathname.startsWith("/countries/") && url.searchParams.has("country")) {
    url.searchParams.delete("country");
    redirectNeeded = true;
  }

  if (redirectNeeded) return NextResponse.redirect(url, 301);

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
