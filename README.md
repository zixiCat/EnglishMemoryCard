# EnglishMemoryCard

EnglishMemoryCard is a markdown-first English retrieval trainer. It turns dated note sections into review cards, lets you practice from short Keys back to full Values, and schedules successful recalls on a forgetting curve.

The app is built for one main workflow:

- keep your source material in repo-local markdown
- group spoken chunks under short, fast Keys
- review the Key first, then reveal the Value
- use `Hit` or `Retry` to control how the card moves through the schedule

## What The App Actually Uses

- Source of truth: `apps/english-memory-card/src/app/data/*.md`
- Each review section starts at a dated heading whose text begins with a supported date, such as `## 2026-04-28` or any deeper dated heading.
- Nested headings that are not new dated headings stay inside the same dated section.
- Review progress is stored locally in the browser under `english-memory-card-progress`.
- Cards marked as remembered leave the due queue and show up later according to the forgetting curve.

## Review Actions

The main review screen has two buttons, and they do different things:

| Button  | Meaning in practice                                                           | What the app does                                                                    | Effect on the curve                                |
| ------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| `Hit`   | You could retrieve the Value correctly and cleanly from the Key.              | Increases the card stage by 1 and schedules the next review by the forgetting curve. | Moves the card forward.                            |
| `Retry` | You could not retrieve it reliably yet, or the recall was too fuzzy to count. | Resets the card to stage `0` and brings it back in `10` minutes.                     | Restarts the card from the beginning of the curve. |

In other words:

- `Hit` means “this recall counts”.
- `Retry` means “do not count this recall yet; show it again soon”.

So yes, both buttons affect the memory curve:

- `Hit` advances the card along the curve.
- `Retry` interrupts that progress, resets the stage, and forces a short retry cycle before the card can start advancing again.

## Forgetting Curve

Every successful `Hit` moves the card one stage forward, up to the end of the configured curve:

| Stage after `Hit` | Next review in |
| ----------------- | -------------- |
| `1`               | `1` day        |
| `2`               | `3` days       |
| `3`               | `7` days       |
| `4`               | `14` days      |
| `5`               | `30` days      |
| `6`               | `60` days      |

`Retry` does not use the day-based curve for its next appearance. It schedules a quick reappearance after `10` minutes and resets the stage to `0`.

## Writing Notes

The app reads markdown directly from:

```text
apps/english-memory-card/src/app/data/
```

Each dated section becomes the source for one or more review cards.

Example:

```md
## 2026-04-30 Meeting Notes

- I am not following your logic.
- Can you slow that down?

#### Hash Keys

- Key: [LOGIC_GAP] | Value: I am not following your logic.
- Key: [SLOW_DOWN] | Value: Can you slow that down?
```

Important rules:

- A dated heading starts a section.
- Plain lines can become fallback drills automatically.
- Structured `Key` / `Value` lines are preferred when they exist.
- Repeating the same `Key:` inside one dated section merges those lines into one drill with multiple Values.

That last point matters: if a section contains any structured hash-drill lines, the app uses those structured drills instead of auto-generated fallback keys from the plain lines in that section.

## Supported Card Syntax

There are two practical ways to write content.

### 1. Plain Notes

You can write ordinary bullet points or numbered lines:

```md
### 2026-04-30

- Somebody's talking to me, but I'm really not comprehending.
- Am I supposed to go up?
```

If a dated section has no structured `Key:` lines, the app creates starter keys automatically from the first few English words.

### 2. Structured Hash Drills

For stable retrieval practice, use explicit `Key:` and `Value:` lines:

```md
### 2026-04-30

- Key: [GAP] | Value: Somebody's talking to me, but I'm really not comprehending.
- Key: [GAP] | Value: I'm not following your logic.
- Key: [NEXT] | Value: Am I supposed to go up?
- Key: [NEXT] | Note: route decision | Value: Which way do I go from here?
```

Fields that currently affect card generation:

- `Key`
- `Value`
- `Note`

Extra pipe-separated metadata can stay in your notes, but the current hash-drill parser only uses the fields above to build the actual review cards.

Practical authoring rules:

- Keep Keys short and easy to trigger.
- Keep each Key at `1-3` Values when possible.
- If one Key grows beyond `3` Values, split it into sharper clusters.
- Use repeated Keys only when the grouped Values really belong to the same retrieval cue.

## Interface Behavior

- Due cards appear in the main queue.
- Cards you reviewed successfully move to the remembered drawer until they become due again.
- The drawer shows the last review time and the next due date for remembered cards.
- If no cards are due, you can still open the remembered drawer for early review.

## Local Development

Install dependencies:

```sh
npm install
```

Run the local app:

```sh
npm start
```

Create a production build:

```sh
npm run build
```

Run lint checks:

```sh
npm run lint
```

## GitHub Pages Build And Publish

Build a GitHub Pages-ready static export into `.github-pages-dist/`:

```sh
npm run build:pages
```

Publish the static export into `docs/`, create a commit, and push to the `gh` remote:

```sh
npm run deploy
```

`docs/` is the committed static output used for GitHub Pages in this repository.

## Most Important Paths

```text
apps/english-memory-card/src/app/data/      Markdown source of truth
apps/english-memory-card/src/app/lib/       Review and parsing logic
apps/english-memory-card/src/app/store/     Local review state
docs/                                       Committed GitHub Pages output
scripts/                                    Build and deploy scripts
```

