// Probe <domain>/favicon.svg (and a couple of common icon paths) for the
// issuers still missing a logo, and for those whose crawl only found a wide
// wordmark. Favicons are icon-shaped — ideal inside a circle.
import fs from "node:fs";
import path from "node:path";

const OUT = "public/logos/svg";
const WANT = `avici|avici.money
bitget|bitget.com
bitpay|bitpay.com
bleap|bleap.finance
bybit|bybit.com
cashi|cashi.com
coca|coca.xyz
etherfi|ether.fi
exa|exactly.app
fold|foldapp.com
gemini|gemini.com
gnosispay|gnosispay.com
gokubu|gokubu.com
hawala|usehawala.com
kast|kast.xyz
kolo|kolo.in
lava|lava.xyz
ledger|ledger.com
metamask|metamask.io
mexc|mexc.com
nocturne|nocturne.cards
phantom|phantom.com
ruvo|ruvo.com
shakepay|shakepay.com
solayer|solayer.org
solflare|solflare.com
tria|tria.so
tuyo|tuyo.com
wirex|wirexapp.com
altitude|altitude.fi
avalanche|avalanchecard.com
bitunix|bitunix.com
coinjar|coinjar.com
cryptocom|crypto.com
dolarapp|dolarapp.com
dpt|dpt.xyz
el|eldorado.io
holyheld|holyheld.com
hyperbeat|hyperbeat.org
kraken|kraken.com
oobit|oobit.com
payitfast|payitfast.com
plutus|plutus.it
redotpay|redotpay.com
vaultleap|vaultleap.com`
  .split("\n")
  .map((l) => l.split("|"));

const PATHS = ["/favicon.svg", "/icon.svg", "/logo.svg", "/favicon.ico.svg"];

const found = [];
const miss = [];
for (const [key, domain] of WANT) {
  let saved = null;
  for (const p of PATHS) {
    const url = `https://${domain}${p}`;
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!r.ok) continue;
      const t = await r.text();
      if (!t.trimStart().startsWith("<svg")) continue;
      fs.writeFileSync(path.join(OUT, `${key}.svg`), t);
      saved = url;
      break;
    } catch {}
  }
  if (saved) found.push(`${key}  ${saved}`);
  else miss.push(key);
}
console.log(`SAVED (${found.length}):`);
found.forEach((f) => console.log("  " + f));
console.log(`STILL MISSING (${miss.length}): ${miss.join(", ")}`);
