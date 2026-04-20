# EnglishMemoryCard

EnglishMemoryCard turns dated Markdown study notes into a phone-first review deck. The app parses sections whose `##` headings start with a date, then presents them as full-screen cards ordered by a simple forgetting-curve schedule.

## Markdown Format

Each review card starts with a level-2 or deeper heading whose text begins with a date. The rest of the heading becomes the card title.

```md
### 2026-04-20 Travel Phrases
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

This is the simplest deployment flow.

After your changes are committed, pushing to `master` automatically triggers the workflow in `.github/workflows/deploy-pages.yml`, which builds the site and deploys it to GitHub Pages.

Use this sequence when your notes or UI change:

```sh
npm run import:cards -- "C:\Users\huangzixi\OneDrive\EnglishMemoryCard"
git add .
git commit -m "update study deck"
git push origin master
```

GitHub Actions handles the build and deploy step after the push. You do not need to run a separate deploy command locally.

If you want to verify the Pages artifact locally before pushing, you can still build it with:

```sh
npm run build:pages
```

That command writes the static site to `.github-pages-dist` with relative asset paths, a `404.html` fallback, and `.nojekyll`.

In your GitHub repository settings, set Pages to use **GitHub Actions** as the source.

### Docs Folder Static Deployment

If you want the compiled site committed under `docs/` for branch-based static hosting, run:

```sh
npm run export:docs
```

That command builds the site into a temporary folder, then publishes `index.html`, `404.html`, `.nojekyll`, and the hashed assets into `docs/`. If the repository still has a previous root-level export, the command removes those legacy generated files during the same run.

Use this flow only if your repository is configured for branch-based Pages hosting from `docs/`.

In your GitHub repository settings, set Pages to use **Deploy from a branch**, choose your publishing branch, and set the folder to **/docs**.

### Important Note About OneDrive Content

GitHub Actions cannot read your local OneDrive folder. The deployment flow depends on the generated data file already being committed.

Use this sequence when your notes change and you are deploying with GitHub Actions Pages:

```sh
npm run import:cards -- "C:\Users\huangzixi\OneDrive\EnglishMemoryCard"
git add .
git commit -m "update study deck"
git push origin master
```

If you are using docs-folder hosting instead of GitHub Actions Pages, replace the commit-only flow above with:

```sh
npm run export:docs
```

Then commit and push the updated generated note data and exported static files under `docs/`.

## Review Flow

- Cards are sorted by their next due date.
- Swiping vertically behaves like a short-form feed with one card per viewport.
- Tapping `Remembered` schedules the next review using spaced intervals of 1, 3, 7, 14, 30, and 60 days.
- Tapping `Again soon` pushes the card back into the queue after 10 minutes.
- Review progress is stored in browser local storage.
