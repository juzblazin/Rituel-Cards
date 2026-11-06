// Crawl issuer homepages via treg's tinyfish.web.fetch (free) for SVG logo
// URLs, then download the best candidate per brand into public/logos/svg/.
// Token comes from TREG_TOKEN env — never stored in this file.
//
// Usage: TREG_TOKEN=... node scripts/crawl-logo-svgs.mjs [misses-file]
//   misses-file lines: "key|domain" — defaults to the Simple Icons miss list.

import fs from "node:fs";
import path from "node:path";

const OUT = "public/logos/svg";
const TREG = "https://treg.to/call/tinyfish.web.fetch";
const TOKEN = process.env.TREG_TOKEN;
if (!TOKEN) {
  console.error("set TREG_TOKEN");
  process.exit(1);
}

const MISSES = process.argv[2]
  ? fs.readFileSync(process.argv[2], "utf8")
  : `allscale|allscale.io
altitude|altitude.fi
avalanche|avalanchecard.com
avici|avici.money
bitget|bitget.com
bitpay|bitpay.com
bitunix|bitunix.com
bleap|bleap.finance
bybit|bybit.com
cashi|cashi.com
coca|coca.xyz
coinjar|coinjar.com
cryptocom|crypto.com
deblock|deblock.com
dolarapp|dolarapp.com
dpt|dpt.xyz
el|eldorado.io
ethena|ethena.fi
etherfi|ether.fi
exa|exactly.app
fold|foldapp.com
gemini|gemini.com
gnosispay|gnosispay.com
gokubu|gokubu.com
hawala|usehawala.com
holyheld|holyheld.com
hyperbeat|hyperbeat.org
jupiter|jup.ag
kast|kast.xyz
kolo|kolo.in
kraken|kraken.com
lava|lava.xyz
ledger|ledger.com
metamask|metamask.io
mexc|mexc.com
nexo|nexo.com
nocturne|nocturne.cards
oobit|oobit.com
payitfast|payitfast.com
phantom|phantom.com
plasma|plasma.org
plutus|plutus.it
redotpay|redotpay.com
ruvo|ruvo.com
shakepay|shakepay.com
solayer|solayer.org
solflare|solflare.com
tria|tria.so
tuyo|tuyo.com
vaultleap|vaultleap.com
wirex|wirexapp.com
yodl|yodl.me`;

const issuers = MISSES.trim().split("\n").map((l) => l.trim().split("|"));

// Score an image URL for "is this the brand logo svg". Higher = better.
function score(url, key, domain) {
  const u = decodeURIComponent(url).toLowerCase();
  if (!u.endsWith(".svg") && !u.includes(".svg?")) return -1;
  const file = u.split("/").pop().split("?")[0];
  const stem = file.replace(".svg", "");
  const token = key.replace(/[^a-z0-9]/g, "");
  const dom = domain.split(".")[0].replace(/^use/, "");
  let s = 0;
  if (stem === "logo" || stem === "logo-icon" || stem === "logo-mark") s += 60;
  if (u.includes("logo")) s += 40;
  if (stem === token || stem === `${token}-logo` || stem === `${token}logo`) s += 70;
  if (token.length >= 4 && stem.includes(token)) s += 45;
  if (token.length >= 4 && u.includes(token)) s += 20;
  if (dom !== token && stem.includes(dom)) s += 30;
  if (stem.includes("icon") || stem.includes("mark") || stem.includes("symbol")) s += 12;
  if (stem.includes("small") || stem.includes("favicon") || stem.includes("square")) s += 8;
  if (stem.includes("full") || stem.includes("wordmark") || stem.includes("horizontal")) s -= 20;
  if (u.includes("flag") || u.includes("icon-") || u.includes("/icons/")) s -= 15;
  if (u.includes("app-store") || u.includes("google-play") || u.includes("award")) s -= 40;
  return s;
}

async function fetchPage(urls) {
  const res = await fetch(TREG, {
    method: "POST",
    headers: {
      "X-Treg-Token": TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      urls,
      format: "markdown",
      links: false,
      image_links: true,
      ttl: 3600,
      per_url_timeout_ms: 15000,
    }),
  });
  if (!res.ok) throw new Error(`treg ${res.status}: ${await res.text()}`);
  return res.json();
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) return false;
  const body = await res.text();
  if (!body.trimStart().startsWith("<svg") && !body.includes("<svg")) return false;
  fs.writeFileSync(dest, body);
  return true;
}

fs.mkdirSync(OUT, { recursive: true });
const report = [];

// Batch 6 domains per call.
for (let i = 0; i < issuers.length; i += 6) {
  const batch = issuers.slice(i, i + 6);
  let data;
  try {
    data = await fetchPage(batch.map(([, d]) => `https://${d}`));
  } catch (e) {
    batch.forEach(([k, d]) => report.push(`${k}|FAIL ${e.message.slice(0, 60)}`));
    continue;
  }
  for (const [key, domain] of batch) {
    const r = (data.results || []).find(
      (x) => x.url.includes(domain) || (x.final_url || "").includes(domain.split(".")[0]),
    );
    const links = (r && r.image_links) || [];
    const ranked = links
      .map((u) => ({ u, s: score(u, key, domain) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s);
    let ok = false;
    for (const { u } of ranked.slice(0, 3)) {
      const abs = u.startsWith("http") ? u : new URL(u, `https://${domain}`).href;
      if (await download(abs, path.join(OUT, `${key}.svg`))) {
        report.push(`${key}|${abs}`);
        ok = true;
        break;
      }
    }
    if (!ok) report.push(`${key}|MISS ${ranked[0]?.u ?? "no svg links"}`);
  }
}
report.forEach((l) => console.log(l));
