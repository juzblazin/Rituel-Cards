import fs from "node:fs";
const f = "src/components/ui.tsx";
let t = fs.readFileSync(f, "utf8");
const keys = ["allscale","avalanche","bitunix","bleap","coinbase","deblock","dolarapp","el","ethena","holyheld","hyperbeat","jupiter","nexo","okx","payitfast","picnic","plutus","redotpay","revolut","robinhood","solidyield","vaultleap","yodl"];
let n = 0;
for (const k of keys) {
  const re = new RegExp(`(${k}: ")${k}\\.(png|svg)(")`);
  if (re.test(t)) {
    t = t.replace(re, `${k}: "svg/${k}.svg"`);
    n++;
  }
}
t = t.replace('nocturne: "nocturne.svg"', 'nocturne: "svg/nocturne.svg"');
fs.writeFileSync(f, t);
console.log("updated", n, "entries + nocturne");
