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

## Deploy To GitHub Pages

This repository now supports two static deployment flows.

### GitHub Actions Pages Deployment

Build the Pages artifact locally with:

```sh
npm run build:pages
```

This writes the static site to `.github-pages-dist` with relative asset paths, a `404.html` fallback, and `.nojekyll`.

The workflow in `.github/workflows/deploy-pages.yml` deploys that artifact automatically on pushes to `master`.

In your GitHub repository settings, set Pages to use **GitHub Actions** as the source.

### Docs Folder Static Deployment

If you want the compiled site committed under `docs/` for branch-based static hosting, run:

```sh
npm run export:docs
```

That command builds the site into a temporary folder, then publishes `index.html`, `404.html`, `.nojekyll`, and the hashed assets into `docs/`. If the repository still has a previous root-level export, the command removes those legacy generated files during the same run.

In your GitHub repository settings, set Pages to use **Deploy from a branch**, choose your publishing branch, and set the folder to **/docs**.

### Important Note About OneDrive Content

GitHub Actions cannot read your local OneDrive folder. The deployment flow depends on the generated data file already being committed.

Use this sequence when your notes change:

```sh
npm run import:cards -- "C:\Users\huangzixi\OneDrive\EnglishMemoryCard"
npm run export:docs
```

If you deploy with GitHub Actions instead of docs-folder hosting, you can replace the second command with:

```sh
npm run build:pages
```

Then commit and push the updated generated note data, workflow, and any exported static files under `docs/` that you want GitHub Pages to serve.

## Review Flow

- Cards are sorted by their next due date.
- Swiping vertically behaves like a short-form feed with one card per viewport.
- Tapping `Remembered` schedules the next review using spaced intervals of 1, 3, 7, 14, 30, and 60 days.
- Tapping `Again soon` pushes the card back into the queue after 10 minutes.
- Review progress is stored in browser local storage.
