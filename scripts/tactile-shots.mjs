// Screenshot pass for the /tactile showcase page.
// Usage: node scripts/tactile-shots.mjs <before|after>
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import path from "node:path";

const tag = process.argv[2] ?? "before";
const outDir = path.resolve("tactile-audit", tag);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("console", (m) => {
  if (m.type() === "error") console.log("console error:", m.text());
});
await page.goto("http://localhost:3000/tactile", { waitUntil: "networkidle" });
await page.waitForTimeout(600);

const shot = async (name, locator) => {
  const el = locator.first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  await el.screenshot({ path: path.join(outDir, `${name}.png`) });
  console.log("saved", name);
};

const light = page.locator("#buttons").first();
await shot("01-buttons", light);
await shot("02-fields", page.locator("#fields").first());
await shot("03-cards", page.locator("#cards").first());
await shot("04-tables", page.locator("#tables").first());

// Buttons pressed state (primary button, mid-press).
const primary = page.locator("#buttons button").first();
const box = await primary.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.waitForTimeout(120);
await shot("05-button-pressed", light);
await page.mouse.up();
await page.waitForTimeout(200);

// Dropdown open.
await page.locator("#menus").first().scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
const menuContent = page.locator('[data-slot="dropdown-menu-content"]').first();
for (let attempt = 0; attempt < 3; attempt++) {
  await page.getByRole("button", { name: "Sort by" }).first().click({ force: true });
  try {
    await menuContent.waitFor({ state: "visible", timeout: 2000 });
    break;
  } catch {
    console.log(`menu not open after attempt ${attempt + 1}`);
  }
}
await page.waitForTimeout(300);
if (await menuContent.isVisible()) {
  await menuContent.screenshot({ path: path.join(outDir, "06-dropdown-open.png") });
  console.log("saved 06-dropdown-open");
} else {
  await page.screenshot({ path: path.join(outDir, "06-dropdown-FAILED.png") });
  console.log("06 FAILED - dumped viewport");
}
await page.keyboard.press("Escape");
await page.waitForTimeout(300);

// Sheet open.
const sheetContent = page.locator('[data-slot="sheet-content"]').first();
for (let attempt = 0; attempt < 3; attempt++) {
  await page.getByRole("button", { name: "Open filters" }).first().click({ force: true });
  try {
    await sheetContent.waitFor({ state: "visible", timeout: 2000 });
    break;
  } catch {
    console.log(`sheet not open after attempt ${attempt + 1}`);
  }
}
await page.waitForTimeout(400);
if (await sheetContent.isVisible()) {
  await sheetContent.screenshot({ path: path.join(outDir, "07-sheet-open.png") });
  await page.screenshot({ path: path.join(outDir, "08-sheet-full.png") });
  console.log("saved 07-sheet-open, 08-sheet-full");
} else {
  await page.screenshot({ path: path.join(outDir, "07-sheet-FAILED.png") });
  console.log("07 FAILED - dumped viewport");
}
await page.keyboard.press("Escape");
await page.waitForTimeout(400);

// Chart card inside Heavyweights.
const chartCard = page
  .locator('svg[role="img"][aria-label*="Monthly card volume"]')
  .first()
  .locator("..");
await shot("09-chart", chartCard);
await shot("10-leaderboard", page.locator("main section.mt-14").first());

await browser.close();
console.log("done ->", outDir);
