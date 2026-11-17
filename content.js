// Runs at document_start, before Lichess has parsed any HTML or drawn a board.
// 1. Synchronously hide 2D pieces so the default set can never flash.
// 2. Read the prebuilt stylesheet (one local storage read, a few ms).
// 3. Insert it and unhide. A safety timer unhides after 800 ms no matter what.
const STYLE_ID = "chesscom-pieces-style";
const root = document.documentElement;

const guard = document.createElement("style");
guard.textContent = "html .is2d piece{visibility:hidden !important}";
root.appendChild(guard);
const unhide = () => guard.remove();
const safety = setTimeout(unhide, 800);

function setStyle(css) {
  let el = document.getElementById(STYLE_ID);
  if (!css) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    root.appendChild(el);
  }
  if (el.textContent !== css) el.textContent = css;
}

chrome.storage.local.get("activeCss").then(
  ({ activeCss }) => {
    setStyle(activeCss);
    clearTimeout(safety);
    unhide();
  },
  () => unhide()
);

// Theme switches / toggling apply live without a reload.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "activeCss" in changes) setStyle(changes.activeCss.newValue);
});
