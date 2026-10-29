# Numa Learning App

A small, offline-first installable web app for studying the constructed language Numa. It uses plain HTML, CSS, and JavaScript—no framework, build step, external font, analytics, or network API.

## Features

- Flashcards in both directions (Numa → English and English → Numa)
- All-vocabulary and core starter sets
- Quick multiple-choice quiz
- Searchable dictionary
- Compact grammar reference based on `Numa_Grammar_and_Dictionary_v1.0.0.md`
- Writing-system workshop that clearly marks glyphs as not yet designed
- Local study progress, mastered-word tracking, JSON export, reset option
- Web app manifest and service worker for offline use after first load
- Responsive Android-friendly layout

## Run locally

A service worker requires a secure context (`https://` or `localhost`). From this directory, run one of:

### Python
```bash
python3 -m http.server 8080
```
Then open `http://localhost:8080` on the same device.

### Node
```bash
npx serve .
```

For installation on an Android phone, deploy the folder to a static host with HTTPS (for example, a static site host you control), open the HTTPS URL in Chrome, then use the browser menu and choose **Install app** or **Add to Home screen**. Some browsers may show only “Add to Home screen.”

## Offline behavior

The service worker caches the app shell on the first successful visit. Study progress is stored in the browser's local storage on that device. Clearing browser/site data will remove that progress, so use **Export progress** to make a backup.

## Language-data policy

The vocabulary is taken from the Numa Grammar & Dictionary v1.0.0 working draft plus the separately selected `ñai` = “good”. The dictionary labels roots provisional where the source does. Grammar notes preserve unresolved points instead of silently deciding them.

The Numa writing system is planned to be meaning-based/logographic, with organic simplified glyphs, left-to-right writing, and learned pronunciation for compounds. The actual glyph inventory is not finalized; the app does not claim any placeholder is an official glyph.

## Project files

- `index.html` — app layout and views
- `styles.css` — responsive visual design
- `app.js` — vocabulary, flashcards, quiz, dictionary, progress
- `manifest.webmanifest` — installable web app metadata
- `sw.js` — offline app-shell caching
- `icon.svg` — app icon
