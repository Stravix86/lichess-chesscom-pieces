# Lichess Chess.com Pieces

A small browser extension that swaps Lichess's 2D pieces for any of 37 Chess.com piece sets (Neo, Classic, Wood, Glass, 8-Bit, 3D Wood, …).

## Install

**[⬇ Download lichess-chesscom-pieces.zip](https://github.com/Stravix86/lichess-chesscom-pieces/releases/latest/download/lichess-chesscom-pieces.zip)** and unzip it.

**Chrome / Edge / Brave**
1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and select the unzipped folder.
3. Click the extension icon to pick a set, preview it, or switch it off.

**Firefox:** `about:debugging` → **This Firefox** → **Load Temporary Add-on** → select `manifest.json` in the unzipped folder. (Firefox removes temporary add-ons when it restarts.)

## How it stays fast

- When you pick a set, the background worker downloads its 12 images once, keeps PNG or WebP (whichever is smaller) and saves a ready-made stylesheet locally.
- On Lichess, the content script runs at `document_start`, reads that one saved stylesheet (a few ms) and applies it before the board is drawn. Nothing hits the network at page load, and nothing runs during play.
- Pieces are briefly hidden until the style is in place, so the default Lichess set never flashes (with an 800 ms safety fallback).

## Notes

- Only 2D boards are changed; Lichess's 3D mode is not.
- Piece images belong to Chess.com. They are downloaded from Chess.com to your own browser and are not included in this repository. For personal use.
