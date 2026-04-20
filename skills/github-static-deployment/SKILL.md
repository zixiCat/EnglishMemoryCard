# GitHub Static Deployment

Use this flow when the English Memory Card site needs to be published as a static GitHub Pages site.

## Deployment Modes

### GitHub Actions Pages

This is the preferred flow when you want deployment to happen automatically after pushing to GitHub.

After you commit and push to `master`, the workflow at `.github/workflows/deploy-pages.yml` builds the site and deploys it for you.

Typical flow:

```sh
npm run import:cards -- "C:\Users\huangzixi\OneDrive\EnglishMemoryCard"
git add .
git commit -m "update study deck"
git push origin master
```

You only need to build the Pages artifact locally if you want to inspect it before pushing:

```sh
npm run build:pages
```

That writes the deployable static files to `.github-pages-dist` and prepares:

- `index.html`
- `404.html`
- `.nojekyll`

There is no separate local deploy step for this mode.

Repository setting required:

- GitHub Pages source must be set to `GitHub Actions`.

### Docs Folder Static Hosting

If the hosting flow requires the built site to live in `docs/`, run:

```sh
npm run export:docs
```

This flow:

1. Builds the static site with relative asset paths.
2. Publishes `index.html`, `404.html`, `.nojekyll`, and the generated assets into `docs/`.
3. Removes the old root-level exported files if the repository still has a legacy root export.

Repository setting required:

- GitHub Pages source must be set to `Deploy from a branch`, with the publishing folder set to `/docs`.

## Recommended Order

1. Import new Markdown content locally if needed.
2. For GitHub Actions deployment: commit and push to `master`. GitHub handles the build and deploy.
3. For docs-folder hosting: run `npm run export:docs`, then commit and push the generated `docs/` files.

## Important Constraint

GitHub Pages builds in GitHub cannot access local OneDrive content. Always commit the generated note data after running `npm run import:cards` locally.