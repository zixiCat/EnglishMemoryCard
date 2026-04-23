# Markdown Notes To Cards

Use this flow when Markdown study notes in the repository need to become review cards for the English Memory Card site.

## Source Of Truth

- Store note files in `apps/english-memory-card/src/app/data`.
- The app reads `.md` files from that folder directly during development and production builds.
- Each card section starts with a `##` or deeper heading whose text begins with a date.

Supported heading formats:

- `## 2026-04-20 Topic`
- `## 2026/04/20 Topic`
- `## 2026.04.20 Topic`
- `## 2026年4月20日 Topic`

## Workflow

Edit the Markdown file directly, for example:

```sh
apps/english-memory-card/src/app/data/2026.md
```

Then run the app or a build:

```sh
npm start
```

```sh
npm run build
```

## Output

- The website parses the Markdown files directly.
- No generated note module is required.

## Validation

1. Edit a Markdown file in `apps/english-memory-card/src/app/data`.
2. Start the app with `npm start` and verify the new cards appear.
3. Run `npm run build` before deploying if you want a production check.
4. Commit the Markdown source changes before deploying to GitHub Pages.