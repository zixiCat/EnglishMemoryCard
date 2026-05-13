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

The recommended format is now the simple one-line form you asked for: one dated section, then one `Key - Value` bullet per card entry.

```md
### 2026-04-21

- Key1 - xxxxxx.
- Key2 - xxxxxx (xxx)
- Key1 - xxxx
- Key3 - xxxx
- Key2 - xxxxx (xxxx)
```

This is enough. You do not need to keep both:

- a plain sentence list
- and a separate `#### Hash Keys` block

Important rules:

- A dated heading starts a section.
- Each `- Key - Value` line becomes structured review content.
- Repeating the same Key inside one dated section merges those lines into one drill with multiple Values.
- Parentheses in the Value are kept as part of the sentence.

## Supported Card Syntax

There are now two useful formats, but the simple one should be your default.

### 1. Recommended: Simple `Key - Value`

```md
### 2026-04-30

- comprehension_gap - Somebody's talking to me, but I'm really not comprehending.
- comprehension_gap - I'm not following your logic.
- next_step - Am I supposed to go up?
```

Practical authoring rules:

- Keep the Key short and easy to trigger.
- Keep each Key at `1-3` Values when possible.
- If one Key grows beyond `3` Values, split it into sharper clusters.
- Use repeated Keys only when the grouped Values really belong to the same retrieval cue.

### How To Choose A Key

Treat each Key like a fast speaking trigger, not a note label.

- Start with the cue you naturally use to think of the sentence in real life.
- Prefer the shortest cue that still brings back the line within about one second.
- Good cues usually come from a scene, an action, an emotion, an interaction, or a speaking function.
- If a phrase already comes out naturally in a certain situation, let the Key mirror that situation instead of explaining the sentence.
- One Key should point to one retrieval action. If you need to explain the Key to yourself, it is usually too broad or too descriptive.
- Reuse a Key only when the grouped Values truly belong to the same speaking move.
- Replace placeholder names such as `xxx`, `something`, or long explanation-style labels with a shorter cue you would actually recognize under pressure.

Useful test:

- If you see the Key and can immediately picture when you would say it, the Key is probably good.
- If you see the Key and have to decode what it means first, rewrite it.

### 2. Backward Compatible: Explicit `Key:` / `Value:`

Old notes can still use the more explicit pipe syntax:

```md
### 2026-04-30

- Key: [GAP] | Value: Somebody's talking to me, but I'm really not comprehending.
- Key: [GAP] | Value: I'm not following your logic.
- Key: [NEXT] | Value: Am I supposed to go up?
- Key: [NEXT] | Note: route decision | Value: Which way do I go from here?
```

Fields that currently affect card generation in the explicit syntax:

- `Key`
- `Value`
- `Note`

If a dated section contains no structured lines at all, the app can still fall back to plain note lines and auto-generate starter keys from the first few English words.

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

