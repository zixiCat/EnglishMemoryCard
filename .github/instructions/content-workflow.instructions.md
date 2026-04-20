---
name: Content Workflow
description: Source-of-truth rules for study note markdown content.
applyTo: "apps/english-memory-card/src/app/**"
---

# Content Workflow Standards

- The study note source of truth lives in `apps/english-memory-card/src/app/data/*.md`.
- Do not reintroduce generated note modules as the primary content source unless the user explicitly asks for that workflow.
- Each review card starts at a `##` or deeper heading whose text begins with a supported date.
- GitHub Pages builds read the committed repo-local Markdown files directly, so deployment should operate on repository content instead of external local folders.