# GitHub Static Deployment

Use this flow when the English Memory Card site needs to be published as a static GitHub Pages site.

## Deployment Modes

### GitHub Actions Pages

Build the Pages artifact:

```sh
npm run build:pages
```

This writes the deployable static files to `.github-pages-dist` and prepares:

- `index.html`
- `404.html`
- `.nojekyll`

The workflow at `.github/workflows/deploy-pages.yml` deploys that folder on pushes to `master`.

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
2. Run `npm run build:pages` for GitHub Actions deployment or `npm run export:docs` for docs-folder hosting.
3. Commit the generated files.
4. Push to `master`.

## Important Constraint

GitHub Pages builds in GitHub cannot access local OneDrive content. Always commit the generated note data after running `npm run import:cards` locally.