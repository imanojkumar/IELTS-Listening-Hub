# IELTS Listening Hub

A production-ready, statically-exported web app for **IELTS General Training Listening** practice. Ten CBT-style mock tests ship in the box: fixed audio bar, three-column exam layout, embedded answer fields, instant auto-save, review flags, a built-in answer key, a section timer, and high-contrast mode.

Built with **Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · shadcn-style UI · Lucide**. No database — every test is a JSON file, and the whole site exports to static HTML for GitHub Pages (or any static host).

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

Build a static site into `out/`:

```bash
npm run build    # regenerates the registry, then exports static HTML
```

`npm run dev` and `npm run build` both run `scripts/generate-registry.mjs` first (via `predev` / `prebuild`), so the homepage always reflects whatever test JSON files are present.

---

## Project structure

```
public/
  audio/        test01.mp3 … test10.mp3        (listening recordings)
  images/       test01.png … test10.png        (question snapshots)
  favicon.svg
src/
  app/
    page.tsx                 homepage (test grid)
    test/[id]/page.tsx       test runner (statically generated per test)
    admin/page.tsx           ZIP import / validation utility
    layout.tsx, globals.css, not-found.tsx
  components/
    test-runner.tsx          3-column orchestrator + bottom action bar
    test-header.tsx          fixed 70px header
    audio-player.tsx         sticky 90px transport (play, ±10s, speed, volume)
    question-nav.tsx         left sidebar — numbered status buttons
    test-tools.tsx           right sidebar — timer, review list, toggles
    question-group.tsx       renders table / form / notes / choice groups
    blank-input.tsx          inline numbered answer field (auto-saving)
    segments.tsx             interleaves text + blanks
    test-context.tsx         shared answer/review/scoring state
    test-card.tsx, site-footer.tsx, ui/*
  data/
    tests/test01.json … test10.json
    registry.json            (generated — do not edit by hand)
  lib/
    types.ts, utils.ts, tests.ts, use-test-state.ts
scripts/
  seed-tests.mjs             authors the 10 bundled tests
  generate-registry.mjs      builds registry.json from src/data/tests
```

---

## Test data format

Each `src/data/tests/testNN.json` is one test. A test has sections; a section has question **groups**; fill-in groups express their content as `segments` (`{ "text": "…" }` or `{ "blank": 7 }`) so prose and inputs lay out together.

```jsonc
{
  "id": 1,
  "slug": "test01",
  "title": "IELTS General Listening Test 1",
  "type": "IELTS General Training",
  "audio": "/audio/test01.mp3",
  "image": "/images/test01.png",
  "totalQuestions": 10,
  "durationSeconds": 480,
  "sections": [
    {
      "id": 1,
      "title": "Section 1",
      "durationSeconds": 480,
      "questionRange": "1-10",
      "groups": [
        {
          "id": "g1",
          "type": "table",
          "range": "1-5",
          "numbers": [1, 2, 3, 4, 5],
          "marks": 5,
          "instructions": "Complete the table below.",
          "wordLimit": "Write ONE WORD AND/OR A NUMBER for each answer.",
          "tableColumns": ["Room", "Facilities", "Other Information", "Cost per Hour"],
          "tableRows": [
            [
              { "segments": [{ "text": "Elm Room" }] },
              { "segments": [{ "text": "Natural lighting and a " }, { "blank": 1 }] }
            ]
          ]
        }
      ]
    }
  ],
  "answers": {
    "1": ["kitchen"],
    "5": ["14th September", "14 September", "September 14"]
  }
}
```

**Supported group `type`s:** `form`, `table`, `notes`, `sentence`, `short-answer`, `multiple-choice`, `dropdown`, `pick-from-list`, `checkbox` (plus `matching`, `map`, `diagram`, `flow-chart`, `summary`, `classification` modelled by the same structures). Answer matching is case-insensitive and ignores surrounding punctuation and currency symbols; list every acceptable variant in `answers`.

---

## Adding more tests

**Option A — drop files in (recommended)**

1. Add `testNN.json` to `src/data/tests/`.
2. Add the matching `audio/testNN.mp3` to `public/audio/` and an optional snapshot to `public/images/`.
3. `npm run build`. The registry regenerates and the card appears automatically — no code changes.

**Option B — validate a content ZIP first**

Open **`/admin`** and drop a ZIP shaped like:

```
tests/   testNN.json …
audio/   testNN.mp3 …
images/  testNN.png …
```

The importer parses every JSON, checks required fields, cross-checks that each referenced audio/image exists, flags missing answer keys, and lets you download a generated `registry.json`. Then copy the files into the folders above and rebuild.

---

## Deploying to GitHub Pages

The app exports to static HTML (`output: "export"` in `next.config.mjs`).

1. **Set the base path** when your repo isn't served from the domain root (e.g. `https://user.github.io/ielts-listening-hub/`):

   ```bash
   NEXT_PUBLIC_BASE_PATH=/ielts-listening-hub npm run build
   ```

   All audio, image, and route URLs are prefixed through the `asset()` / `route()` helpers, so they resolve correctly under the sub-path. For a user/org root site or a custom domain, leave `NEXT_PUBLIC_BASE_PATH` unset.

2. **Publish `out/`.** A `.nojekyll` file is included so GitHub Pages serves `_next/` assets untouched. Point Pages at the `out/` directory, or use an action such as `actions/upload-pages-artifact` with `path: out`.

A minimal workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on: { push: { branches: [main] } }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: NEXT_PUBLIC_BASE_PATH=/${{ github.event.repository.name }} npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: out }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages }
    steps:
      - uses: actions/deploy-pages@v4
```

---

## Features at a glance

- **Auto-start** — five seconds after the page finishes loading, a visible countdown runs and then the recording **and** section timer begin together. If the browser blocks autoplay (some do without a prior gesture), the play button highlights so the candidate can tap once to start.
- **Auto-save** — every keystroke persists to `localStorage` (keyed per test); refresh and your answers return.
- **Section timer** — counts down from 08:00, warns at zero, never force-submits; pause/resume/reset available.
- **Submit & score** — a Submit button (in the action bar and the tools panel) asks for confirmation, then opens a results dialog: estimated **band score** on the left, a full **per-question breakdown** on the right (your answer vs. the key, plus which questions were incorrect or left blank). The results dialog closes **only** via its X button — clicking the backdrop won't dismiss it, so the score can't be lost by accident. "Review my answers" reveals correct/incorrect inline in the test.
- **Review later** — flag questions; jump back to them from the right sidebar.
- **Show answers** — reveals the key inline (green correct / red incorrect) and a running score.
- **Accessibility** — full keyboard navigation, ARIA labels, focus management (the results dialog traps focus), and a high-contrast mode.
- **Audio shortcuts** — `Space` toggles play; `Shift + ←/→` skip 10 seconds.

> **Band score note:** each test is a single 10-question section. The raw score is scaled to a /40 equivalent and mapped through the standard IELTS Listening band table, so the band shown is an *indicative estimate*, not an official result.

---

## Scripts

| Command            | What it does                                            |
| ------------------ | ------------------------------------------------------- |
| `npm run dev`      | Generate registry, then start the dev server            |
| `npm run build`    | Generate registry, then export static HTML to `out/`    |
| `npm run registry` | Regenerate `src/data/registry.json` only                |
| `npm run seed`     | Re-author the 10 bundled tests from `seed-tests.mjs`    |
| `npm run lint`     | Run ESLint                                              |

---

© 2026 IELTS Listening Hub by Manoj Kumar. All Rights Reserved.
IELTS is a registered trademark of its respective owners. This site is independently developed and is not affiliated with, endorsed by, or sponsored by the British Council, IDP Education, or Cambridge.
