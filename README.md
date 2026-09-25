# Remember When

A simple, gentle daily journal app. Each day, the person can write or talk
about their day. The app keeps track of:

- **Special memories** — days marked as commemorative, shown as a bulleted list on the home page.
- **Recent days** — a quick look back at the last few days of entries.
- **Schedule** — upcoming plans (like "excited to go to Disneyland") that were
  mentioned while writing an entry, or added directly on the Schedule page.

## Tech

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Voice-to-text uses the browser's built-in Web Speech API (best support in
  Chrome/Edge; falls back to typing only in unsupported browsers)
- Data is stored locally in plain JSON files under `data/` (`entries.json`,
  `schedule.json`) — no external database or account needed.

## Getting started

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000

## Project structure

- `src/app/page.tsx` — home dashboard (memories, recent days, upcoming)
- `src/app/entry/new/page.tsx` — write/talk a new daily entry
- `src/app/schedule/page.tsx` — upcoming plans / schedule tab
- `src/app/api/entries` — API route for reading/saving journal entries
- `src/app/api/schedule` — API route for reading/saving schedule items
- `src/lib/storage.ts` — reads and writes the JSON data files
- `data/` — where entries and schedule items are actually stored

## Ideas for later

- Photos attached to entries
- A caregiver/family view to add memories or upcoming events on the person's behalf
- Smarter auto-detection of "upcoming plans" mentioned inside the free-text entry (currently the writer adds these explicitly in a separate field)
