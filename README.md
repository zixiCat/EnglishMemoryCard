# EnglishMemoryCard

EnglishMemoryCard is a markdown-first English review app for turning dated note files into spaced-repetition study cards.

The current workflow is optimized for hash retrieval practice:

- Keep your source notes in markdown.
- Group spoken chunks under short English Keys.
- Look at the Key, say the chunk within 0.5s, then reveal the Value.
- Mark successful retrievals as remembered so they move along the forgetting curve.

## Features

- Reads markdown files directly from `apps/english-memory-card/src/app/data/*.md`.
- Treats each dated `##` or `###` heading as a review card section.
- Supports both starter notes and structured hash-drill syntax.
- Merges repeated `Key:` lines inside one section into one drill with multiple `values`.
- Warns when one Key carries more than 3 Values, because that increases collision risk.
- Stores review progress locally and schedules cards by forgetting-curve intervals.

## Getting Started

Install dependencies:

```sh
npm install
```

Start local development:

```sh
npm start
```

Build the app:

```sh
npm run build
```

Build the GitHub Pages output:

```sh
npm run build:pages
```

Publish the docs build:

```sh
npm run deploy
```

## Note Source Of Truth

The source of truth is the markdown content under:

```text
apps/english-memory-card/src/app/data/
```

Each review card starts at a heading whose text begins with a supported date, for example:

```md
## 2026-04-28 Hash Retrieval Method
### 2026-04-29 Daily Notes
```

If the app shows no notes, add a dated `##` or `###` heading in one of those markdown files and refresh.

## Hash Retrieval Syntax

You can write plain bullet notes and let the app generate temporary starter keys from the first few English words.

For stronger retrieval practice, use structured lines like this:

```md
- Key: [GAP] | Intent: communication gap | Value: Somebody's talking to me, I feel like I have to tell them I'm listening but I'm really not comprehending. | Trigger: meeting drift, information overload | Reinforce: mouth moving with no meaning, brain buffering
- Key: [GAP] | Value: I'm not following your logic.
- Key: [NEXT] | Intent: next-step movement | Value: Am I supposed to go up | Trigger: route instruction, next step doubt | Reinforce: upward glance, stair step
```

Supported structured fields:

- `Key`
- `Value`
- `Intent`
- `Trigger` or `Context`
- `Reinforce` or `Cue`
- `Note`

Practical rules:

- Keep Keys short, primitive, and fast to trigger.
- Keep each Key at 1-3 Values when possible.
- If a Key needs more than 3 Values, split it into sharper clusters.
- Repeating the same `Key:` inside one dated section automatically groups those lines into one drill.

## Review Flow

The app is built around two actions:

- `0.5s Hit`: advances the card and schedules the next review.
- `Missed / Rewire`: resets the stage and brings the card back quickly for another attempt.

Remembered cards leave the main queue for now and return later based on the forgetting curve.

## Review Schedule

Clicking `0.5s Hit` advances a card to the next stage and schedules it based on the forgetting curve:

| Review # | Stage transition | Next review in |
| -------- | ---------------- | -------------- |
| 1st      | 0 -> 1           | 1 day          |
| 2nd      | 1 -> 2           | 3 days         |
| 3rd      | 2 -> 3           | 7 days         |
| 4th      | 3 -> 4           | 14 days        |
| 5th      | 4 -> 5           | 30 days        |
| 6th      | 5 -> 6           | 60 days        |

If you miss a card, the app rewires it with a quick retry instead of advancing it.

## Project Commands

| Command               | Purpose                              |
| --------------------- | ------------------------------------ |
| `npm start`           | Run the local dev server             |
| `npm run build`       | Create a production build            |
| `npm run test`        | Run the app tests                    |
| `npm run lint`        | Run lint checks                      |
| `npm run build:pages` | Build the static GitHub Pages output |
| `npm run deploy`      | Publish the docs build               |

