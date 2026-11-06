// Download issuer logo SVGs from the Simple Icons CDN (free) into
// public/logos/svg/. Misses are printed for the tinyfish fallback pass.
import fs from "node:fs";
import path from "node:path";

const OUT = "public/logos/svg";
const ISSUERS = `allscale|allscale.io
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
coinbase|coinbase.com
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
okx|okx.com
oobit|oobit.com
payitfast|payitfast.com
phantom|phantom.com
picnic|usepicnic.com
plasma|plasma.org
plutus|plutus.it
redotpay|redotpay.com
revolut|revolut.com
robinhood|robinhood.com
ruvo|ruvo.com
shakepay|shakepay.com
solayer|solayer.org
solflare|solflare.com
solidyield|solid.xyz
tria|tria.so
tuyo|tuyo.com
vaultleap|vaultleap.com
wirex|wirexapp.com
yodl|yodl.me`.split("\n").map((l) => l.split("|"));

function* candidates(key, domain) {
  yield key;
  const first = domain.split(".")[0].replace(/^use/, "");
  if (first !== key) yield first;
  yield `${key}dotcom`;
  if (first !== `${key}dotcom`) yield `${first}dotcom`;
}

fs.mkdirSync(OUT, { recursive: true });
const hits = [];
const miss = [];
for (const [key, domain] of ISSUERS) {
  let saved = null;
  for (const slug of new Set([...candidates(key, domain)])) {
    const res = await fetch(`https://cdn.simpleicons.org/${slug}`).catch(() => null);
    if (!res || !res.ok) continue;
    const ct = res.headers.get("content-type") || "";
    const body = await res.text();
    if (!ct.includes("svg") && !body.trimStart().startsWith("<svg")) continue;
    fs.writeFileSync(path.join(OUT, `${key}.svg`), body);
    saved = slug;
    break;
  }
  if (saved) hits.push(`${key} (${saved})`);
  else miss.push(`${key}|${domain}`);
}
console.log(`HITS (${hits.length}):`);
hits.forEach((h) => console.log("  " + h));
console.log(`MISS (${miss.length}):`);
miss.forEach((m) => console.log("  " + m));
