import fs from "node:fs";
for (const f of fs.readdirSync("public/logos/svg")) {
  const t = fs.readFileSync("public/logos/svg/" + f, "utf8");
  const vb = /viewBox=["']([^"']+)/.exec(t);
  const w = /\bwidth=["']([0-9.]+)/.exec(t);
  const h = /\bheight=["']([0-9.]+)/.exec(t);
  let ar = "?";
  if (vb) {
    const p = vb[1].trim().split(/[\s,]+/).map(Number);
    if (p.length === 4 && p[3]) ar = (p[2] / p[3]).toFixed(2);
  } else if (w && h) ar = (parseFloat(w[1]) / parseFloat(h[1])).toFixed(2);
  console.log(f.padEnd(22), "ar=" + ar, "bytes=" + t.length);
}
