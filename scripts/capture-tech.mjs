// Captures the domain-neutral demo panels (as shown in variants B, D, E) for their previews and gallery.
// Usage:
//   npm run build && npx vite preview --port 4173
//   node scripts/capture-tech.mjs           (needs `npx playwright install chromium` once)
//   → public/marquee-tech/*.png, then convert to .webp (or point src/data/tech.ts at the PNGs)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = process.env.BASE ?? "http://localhost:4173/e/";
const OUT = fileURLToPath(new URL("../public/marquee-tech/", import.meta.url));
mkdirSync(OUT, { recursive: true });

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 1.5 });
await p.addInitScript(() => sessionStorage.setItem("pf-e-intro", "1"));
await p.route(/mux\.com|cloudfront\.net/, (r) => r.abort());
await p.goto(BASE, { waitUntil: "networkidle" });

const cards = () => p.locator('#work button[aria-label$="열기"]');
async function openCase(i) {
  await cards().nth(i).scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  await cards().nth(i).click({ force: true });
  await p.waitForTimeout(1000);
}
async function close() {
  await p.keyboard.press("Escape");
  await p.waitForTimeout(600);
}
const dlg = () => p.locator('[role="dialog"]');
const demo = (n = 0) => dlg().locator(".demo").nth(n);
async function snap(name, locator, wait = 0) {
  if (wait) await p.waitForTimeout(wait);
  await locator.scrollIntoViewIfNeeded();
  await locator.screenshot({ path: `${OUT}${name}.png` });
  console.log("saved", name);
}
const click = (name) => dlg().getByRole("button", { name, exact: true }).first().click();

await openCase(0);
await snap("agency-field", demo(), 300);
await click("사건 단위 선택");
await snap("agency-event", demo(), 700);
await close();

await openCase(1);
await click("실행");
await snap("pipeline-charset", demo(), 6500);
await click("3건 중 1건 실패");
await click("실행");
await snap("pipeline-partial", demo(), 6500);
await close();

await openCase(2);
await click("작업 완료 이벤트");
await snap("fanout-redis", demo(), 3200);
await click("인스턴스 메모리만");
await click("작업 완료 이벤트");
await snap("fanout-memory", demo(), 3200);
await close();

await openCase(3);
await click("N 인덱스(누수)");
await snap("gpu-leak", demo(), 600);
await click("실행");
await p.waitForTimeout(1600);
await click("GPU 세션 종료");
await snap("gpu-checkpoint", demo(1), 400);
await close();

await openCase(4);
await click("전환 실행");
await snap("https-found", demo(), 4300);
await click("ConfigMap 전환 후 재검증");
await snap("https-fixed", demo(), 4300);
await close();

await openCase(5);
await click("기본 흐름");
await snap("chat-normal", demo(), 5600);
await click("담당자가 먼저 답함");
await snap("chat-staff", demo(), 5600);
await close();

await b.close();
