const DEFAULTS = { enabled: true, theme: "neo" };
const $ = (id) => document.getElementById(id);
const status = (t) => ($("status").textContent = t);

function preview(theme) {
  const codes = ["wr", "wn", "wb", "wq", "wk", "wp", "br", "bn", "bb", "bq", "bk", "bp"];
  $("preview").innerHTML = "";
  for (const c of codes) {
    const img = new Image();
    img.src = pieceUrl(theme, c);
    img.onerror = () => status("Couldn't load this set from Chess.com.");
    $("preview").appendChild(img);
  }
}

(async () => {
  for (const [id, name] of THEMES) $("theme").add(new Option(name, id));
  const { enabled, theme } = await chrome.storage.sync.get(DEFAULTS);
  $("enabled").checked = enabled;
  $("theme").value = theme;
  preview(theme);

  $("enabled").onchange = () => chrome.storage.sync.set({ enabled: $("enabled").checked });
  $("theme").onchange = async () => {
    const t = $("theme").value;
    status("Loading…");
    preview(t);
    // Download first so the switch is instant once saved.
    const res = await chrome.runtime.sendMessage({ type: "getImages", theme: t });
    if (res?.error) return status("Download failed: " + res.error);
    await chrome.storage.sync.set({ theme: t });
    status("Applied. Open Lichess tabs update automatically.");
  };
  $("clear").onclick = async () => {
    status("Re-downloading…");
    const res = await chrome.runtime.sendMessage({ type: "clearCache" });
    status(res?.error ? "Download failed: " + res.error : "Pieces re-downloaded.");
  };
})();
