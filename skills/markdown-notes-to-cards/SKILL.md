# Markdown Notes To Cards

Use this flow when Markdown study notes in OneDrive need to become review cards for the English Memory Card site.

## Inputs

- A folder of `.md` or `.markdown` files.
- Each card section starts with a `##` heading whose text begins with a date.

Supported heading formats:

- `## 2026-04-20 Topic`
- `## 2026/04/20 Topic`
- `## 2026.04.20 Topic`
- `## 2026年4月20日 Topic`

## Command

Windows path:

```sh
npm run import:cards -- "C:\Users\huangzixi\OneDrive\EnglishMemoryCard"
```

WSL path:

```sh
npm run import:cards -- "/mnt/c/Users/huangzixi/OneDrive/EnglishMemoryCard"
```

## Output

- Regenerates `apps/english-memory-card/src/app/data/generated-notes.ts`.
- The website reads that generated file at build time.

## Validation

1. Run the import command.
2. Confirm the generated note file changed.
3. Start the app with `npm start` and verify the new cards appear.
4. Commit the regenerated note data before deploying to GitHub Pages, because GitHub Actions cannot read the local OneDrive folder.