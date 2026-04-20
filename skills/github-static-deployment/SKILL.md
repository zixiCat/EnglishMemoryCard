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

### Branch Root Static Hosting

If the hosting flow requires `index.html` at the repository root, run:

```sh
npm run export:root
```

This flow:

1. Builds the static site with relative asset paths.
2. Publishes `index.html` and the generated assets into the repository root.
3. Updates `.github-pages-root-manifest.json` so stale bundles can be cleaned up safely.

## Recommended Order

1. Import new Markdown content locally if needed.
2. Run `npm run build:pages` for GitHub Actions deployment or `npm run export:root` for branch-root hosting.
3. Commit the generated files.
4. Push to `master`.

## Important Constraint

GitHub Pages builds in GitHub cannot access local OneDrive content. Always commit the generated note data after running `npm run import:cards` locally.