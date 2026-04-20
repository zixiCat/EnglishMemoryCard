# EnglishMemoryCard

EnglishMemoryCard turns dated Markdown study notes into a phone-first review deck. The app parses sections whose `##` headings start with a date, then presents them as full-screen cards ordered by a simple forgetting-curve schedule.

## Markdown Format

Each review card starts with a level-2 heading whose text begins with a date. The rest of the heading becomes the card title.

```md
## 2026-04-20 Travel Phrases
- board the train
- miss the stop

Say:
"I nearly missed my stop because I was reading."
```

Supported date prefixes include `YYYY-MM-DD`, `YYYY/MM/DD`, `YYYY.MM.DD`, and `YYYY年M月D日`.

## Import Notes

Install dependencies first:

```sh
npm install
```

Import the Markdown files from your notes folder:

```sh
npm run import:cards -- "C:\Users\huangzixi\OneDrive\EnglishMemoryCard"
```

If you are running inside WSL or another Linux environment, use the mounted path instead:

```sh
npm run import:cards -- "/mnt/c/Users/huangzixi/OneDrive/EnglishMemoryCard"
```

If you do not pass a path, the importer reads the sample content in `apps/english-memory-card/content`.

The importer writes a generated data module to `apps/english-memory-card/src/app/data/generated-notes.ts`.

## Run The App

Start the local development server:

```sh
npm start
```

Build the production bundle:

```sh
npm run build
```

## Review Flow

- Cards are sorted by their next due date.
- Swiping vertically behaves like a short-form feed with one card per viewport.
- Tapping `Remembered` schedules the next review using spaced intervals of 1, 3, 7, 14, 30, and 60 days.
- Tapping `Again soon` pushes the card back into the queue after 10 minutes.
- Review progress is stored in browser local storage.
