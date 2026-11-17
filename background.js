// Downloads a Chess.com piece set once, shrinks it, turns it into a ready-made
// stylesheet and stores it in chrome.storage.local as `activeCss`. Lichess pages
// read that one key at document_start, so they never wait on this worker or the
// network. This worker only does work when you install, change set or toggle.
if (typeof importScripts === "function") importScripts("themes.js");

const DEFAULTS = { enabled: true, theme: "neo" };
const CODES = ["wp", "wn", "wb", "wr", "wq", "wk", "bp", "bn", "bb", "br", "bq", "bk"];
const CACHE_PREFIX = "img2:"; // bump when the encoding changes
const WEBP_QUALITY = 0.85;

async function blobToDataUrl(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return `data:${blob.type || "image/png"};base64,${btoa(bin)}`;
}

// Re-encode as WebP and keep whichever file is smaller. Detailed sets
// (wood, 3D) shrink ~30-40%; flat sets like Neo stay PNG.
async function smallest(png) {
  try {
    const bmp = await createImageBitmap(png);
    const canvas = new OffscreenCanvas(bmp.width, bmp.height);
    canvas.getContext("2d").drawImage(bmp, 0, 0);
    bmp.close();
    const webp = await canvas.convertToBlob({ type: "image/webp", quality: WEBP_QUALITY });
    return webp.type === "image/webp" && webp.size < png.size ? webp : png;
  } catch {
    return png;
  }
}

async function fetchPiece(theme, code) {
  const res = await fetch(pieceUrl(theme, code));
  if (!res.ok) throw new Error(`${res.status} for ${theme}/${code}`);
  return blobToDataUrl(await smallest(await res.blob()));
}

async function getImages(theme) {
  const key = CACHE_PREFIX + theme;
  const cached = (await chrome.storage.local.get(key))[key];
  if (cached) return cached;
  const entries = await Promise.all(CODES.map(async (c) => [c, await fetchPiece(theme, c)]));
  const images = Object.fromEntries(entries);
  await chrome.storage.local.set({ [key]: images });
  return images;
}

async function rebuild() {
  const { enabled, theme } = await chrome.storage.sync.get(DEFAULTS);
  const activeCss = enabled ? buildCss(await getImages(theme)) : "";
  const { activeCss: current } = await chrome.storage.local.get("activeCss");
  // Skip the write (and the change event in every open tab) when nothing changed.
  if (current !== activeCss) await chrome.storage.local.set({ activeCss });
}

chrome.runtime.onInstalled.addListener(async () => {
  // Drop caches from older versions of the extension.
  const all = await chrome.storage.local.get(null);
  const stale = Object.keys(all).filter((k) => k.startsWith("img") && !k.startsWith(CACHE_PREFIX));
  if (stale.length) await chrome.storage.local.remove(stale);
  rebuild();
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && ("enabled" in changes || "theme" in changes)) rebuild();
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "getImages") {
    getImages(msg.theme).then(
      () => sendResponse({ ok: true }),
      (err) => sendResponse({ error: String(err) })
    );
    return true;
  }
  if (msg?.type === "clearCache") {
    (async () => {
      const all = await chrome.storage.local.get(null);
      await chrome.storage.local.remove(Object.keys(all).filter((k) => k.startsWith("img")));
      await rebuild();
    })().then(
      () => sendResponse({ ok: true }),
      (err) => sendResponse({ error: String(err) })
    );
    return true;
  }
});
