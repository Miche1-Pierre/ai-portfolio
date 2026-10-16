// Renders the signature diorama frames (written by scripts/gen-signature.py) in headless Chrome and
// assembles public/signature/scene.gif with ffmpeg (one palette for the whole loop, no dithering:
// the scene is flat colours). Needs Chrome and ffmpeg on the PATH.
//   node scripts/capture-signature.mjs [chromePath]
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const CHROME = process.argv[2] || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const FRAMES = resolve(".signature-frames");
const OUT = resolve("public/signature/scene.gif");
const WIDTH = 480; // shown at 240 px in the signature: 2x for retina screens
const FPS = 20;
const PORT = 9534;

const { view, frames } = JSON.parse(readFileSync(join(FRAMES, "frames.json"), "utf8"));
const HEIGHT = Math.round((WIDTH * view[3]) / view[2]);
const profile = mkdtempSync(join(tmpdir(), "signature-"));
const chrome = spawn(CHROME, ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  let page;
  for (let i = 0; i < 100 && !page; i++) {
    try {
      page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === "page");
    } catch {}
    if (!page) await sleep(100);
  }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) pending.get(msg.id)(msg.result);
  });
  const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });

  await send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });
  await send("Runtime.evaluate", { expression: `document.body.style.margin = "0"; document.body.style.background = "#fff"` });
  for (let i = 0; i < frames.length; i++) {
    const svg = frames[i].replace("<svg ", `<svg width="${WIDTH}" height="${HEIGHT}" style="display:block" `);
    await send("Runtime.evaluate", { expression: `document.body.innerHTML = ${JSON.stringify(svg)}` });
    const { data } = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 } });
    writeFileSync(join(FRAMES, `f${String(i).padStart(3, "0")}.png`), Buffer.from(data, "base64"));
  }
  // the "PM" monogram (src/components/site/logo.tsx), 2x for an 18 px tall slot
  const logo = `<svg width="78" height="36" viewBox="0 0 52 24" style="display:block"><rect width="8" height="24" rx="1" fill="#418b5c"/><path d="M8 0h5a7 7 0 0 1 0 14H8Z" fill="#ffaa0d"/><rect x="23" width="8" height="24" rx="1" fill="#e14322"/><path d="M31 0h13a6.5 6.5 0 0 1-13 0Z" fill="#f99bc3"/><rect x="44" width="8" height="24" rx="1" fill="#2f6bf6"/></svg>`;
  await send("Runtime.evaluate", { expression: `document.body.style.background = "transparent"; document.body.innerHTML = ${JSON.stringify(logo)}` });
  await send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
  const { data: logoPng } = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 78, height: 36, scale: 1 } });
  writeFileSync(resolve("public/signature/logo.png"), Buffer.from(logoPng, "base64"));
  ws.close();
} finally {
  chrome.kill();
}

const ff = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", join(FRAMES, "f%03d.png"),
  "-filter_complex", "[0:v]split[a][b];[a]palettegen=max_colors=128:stats_mode=full[p];[b][p]paletteuse=dither=none",
  "-loop", "0", OUT], { stdio: "inherit" });
if (ff.status !== 0) process.exit(ff.status ?? 1);
rmSync(FRAMES, { recursive: true, force: true });
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(`OK ${OUT} (${WIDTH}x${HEIGHT}, ${frames.length} frames at ${FPS} fps)`);
