// Crop wide wordmark SVGs to their left-square icon region (viewBox "0 0 H H",
// where the brand mark sits in icon+wordmark layouts), then rasterize every SVG
// in public/logos/svg to a PNG for visual audit in public/logos/svg/_check/.
import fs from "node:fs";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

const DIR = "public/logos/svg";
const CHECK = path.join(DIR, "_check");
fs.mkdirSync(CHECK, { recursive: true });

const WIDE = ["altitude", "avalanche", "coinjar", "cryptocom", "dpt", "el", "holyheld", "kraken", "oobit", "payitfast", "plutus", "redotpay", "vaultleap"];

for (const f of WIDE) {
  const file = path.join(DIR, `${f}.svg`);
  if (!fs.existsSync(file)) continue;
  let t = fs.readFileSync(file, "utf8");
  const vb = /viewBox=["']([^"']+)/.exec(t);
  if (!vb) continue;
  const p = vb[1].trim().split(/[\s,]+/).map(Number);
  if (Math.abs(p[2] - p[3]) < 0.01) continue; // already square
  const H = p[3];
  t = t.replace(vb[0], `viewBox="0 0 ${H} ${H}"`).replace(/width="[^"]*"/, `width="${H}"`);
  fs.writeFileSync(file, t);
}

for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".svg"))) {
  try {
    const resvg = new Resvg(fs.readFileSync(path.join(DIR, f)), {
      fitTo: { mode: "width", value: 128 },
      background: "rgba(255,255,255,1)",
    });
    fs.writeFileSync(path.join(CHECK, f.replace(".svg", ".png")), resvg.render().asPng());
    console.log(f);
  } catch (e) {
    console.log(`${f}  RENDER-FAIL ${e.message.slice(0, 80)}`);
  }
}
