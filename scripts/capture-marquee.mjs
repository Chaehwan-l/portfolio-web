// Captures this site's own interactive panels as images for the marquee and case-card previews.
// Usage:
//   npm run build && npx vite preview --port 4173
//   node scripts/capture-marquee.mjs        (needs `npx playwright install chromium` once)
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = process.env.BASE ?? "http://localhost:4173/";
const OUT = fileURLToPath(new URL("../public/marquee/", import.meta.url));
const shots = [];

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 1.5 });
await p.route(/cloudfront\.net/, (r) => r.abort());
await p.goto(BASE, { waitUntil: "networkidle" });

async function openCase(i) {
  const btns = p.getByRole("button", { name: /Open Case/i });
  await btns.nth(i).scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
  await btns.nth(i).click({ force: true });
  await p.waitForTimeout(900);
}
async function close() {
  await p.keyboard.press("Escape");
  await p.waitForTimeout(500);
}
const dlg = () => p.locator('[role="dialog"]');
async function snap(name, label, locator, wait = 0) {
  if (wait) await p.waitForTimeout(wait);
  await locator.screenshot({ path: `${OUT}${name}.png` });
  shots.push({ name, label });
}
const click = (name) => dlg().getByRole("button", { name, exact: true }).first().click();

await openCase(0);
await snap("agency-field", "Agency state · field max", dlg().locator(".demo").first(), 300);
await click("사건 단위 선택");
await snap("agency-event", "Agency state · event unit", dlg().locator(".demo").first(), 700);
await close();

await openCase(1);
await click("실행");
await snap("pipeline-charset", "E-filing · charset fallback", dlg().locator(".demo").first(), 6500);
await click("3건 중 1건 실패");
await click("실행");
await snap("pipeline-partial", "E-filing · partial failure", dlg().locator(".demo").first(), 6500);
await close();

await openCase(2);
await click("세금신고 완료 이벤트");
await snap("fanout-redis", "Fan-out · Redis Pub/Sub", dlg().locator(".demo").first(), 3200);
await click("인스턴스 메모리만");
await click("세금신고 완료 이벤트");
await snap("fanout-memory", "Fan-out · memory only", dlg().locator(".demo").first(), 3200);
await close();

await openCase(3);
await snap("gpu-snapshot", "GPU eval · N-1 index", dlg().locator(".demo").first(), 600);
await click("N 인덱스(누수)");
await snap("gpu-leak", "GPU eval · leakage check", dlg().locator(".demo").first(), 600);
await click("실행");
await p.waitForTimeout(1600);
await click("GPU 세션 종료");
await snap("gpu-checkpoint", "GPU eval · checkpoint resume", dlg().locator(".demo").nth(1), 400);
await close();

await openCase(4);
await click("전환 실행");
await snap("https-found", "HTTPS cutover · pod check", dlg().locator(".demo").first(), 4300);
await click("ConfigMap 전환 후 재검증");
await snap("https-fixed", "HTTPS cutover · fixed", dlg().locator(".demo").first(), 4300);
await close();

await openCase(5);
await click("기본 흐름");
await snap("chat-normal", "After-hours AI · flow", dlg().locator(".demo").first(), 5600);
await click("담당자가 먼저 답함");
await snap("chat-staff", "After-hours AI · staff first", dlg().locator(".demo").first(), 5600);
await click("이벤트 중복 전달");
await snap("chat-dup", "After-hours AI · idempotency", dlg().locator(".demo").first(), 5600);
await close();

const chart = p.locator("#flow .rounded-\\[40px\\]").first();
await chart.scrollIntoViewIfNeeded();
await snap("flow-chart", "Work area by month", chart, 2500);

await b.close();
writeFileSync(fileURLToPath(new URL("./marquee-shots.json", import.meta.url)), JSON.stringify(shots, null, 2));
console.log("captured", shots.length);
