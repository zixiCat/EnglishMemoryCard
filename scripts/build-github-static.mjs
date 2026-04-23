import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const scriptPath = fileURLToPath(import.meta.url);
const workspaceRoot = resolve(dirname(scriptPath), '..');
const outputDir = resolve(workspaceRoot, '.github-pages-dist');
const docsDir = resolve(workspaceRoot, 'docs');
const legacyRootManifestPath = resolve(workspaceRoot, '.github-pages-root-manifest.json');
const publishDocs = process.argv.includes('--publish-docs');

await buildStaticSite();
await ensureGitHubPagesFiles(outputDir);

if (publishDocs) {
  await cleanupLegacyRootFiles(workspaceRoot, legacyRootManifestPath);
  await publishStaticSiteToDirectory(outputDir, docsDir);
}

async function buildStaticSite() {
  const npmExecPath = process.env.npm_execpath;
  const command = npmExecPath
    ? process.execPath
    : process.platform === 'win32'
      ? 'npm.cmd'
      : 'npm';
  const args = npmExecPath
    ? [npmExecPath, 'run', 'build', '--', '--skip-nx-cache']
    : ['run', 'build', '--', '--skip-nx-cache'];

  await new Promise((resolveBuild, rejectBuild) => {
    const child = spawn(command, args, {
      cwd: workspaceRoot,
      env: {
        ...process.env,
        ENGLISH_CARD_BASE_HREF: './',
        ENGLISH_CARD_OUTPUT_PATH: '.github-pages-dist',
      },
      stdio: 'inherit',
    });

    child.on('exit', (exitCode) => {
      if (exitCode === 0) {
        resolveBuild();
        return;
      }

      rejectBuild(new Error(`Static build failed with exit code ${exitCode ?? 'unknown'}.`));
    });

    child.on('error', rejectBuild);
  });
}

async function ensureGitHubPagesFiles(directoryPath) {
  const indexFilePath = resolve(directoryPath, 'index.html');
  const indexContents = await readFile(indexFilePath, 'utf8');
  const normalizedIndexContents = normalizeBaseHref(indexContents);

  await writeFile(indexFilePath, normalizedIndexContents, 'utf8');
  await writeFile(resolve(directoryPath, '404.html'), normalizedIndexContents, 'utf8');
  await writeFile(resolve(directoryPath, '.nojekyll'), '', 'utf8');
}

async function publishStaticSiteToDirectory(sourceDirectoryPath, targetDirectoryPath) {
  const relativeFiles = await collectRelativeFiles(sourceDirectoryPath);

  await rm(targetDirectoryPath, { recursive: true, force: true });

  for (const relativeFilePath of relativeFiles) {
    const sourceFilePath = resolve(sourceDirectoryPath, relativeFilePath);
    const targetFilePath = resolve(targetDirectoryPath, relativeFilePath);

    await mkdir(dirname(targetFilePath), { recursive: true });
    await copyFile(sourceFilePath, targetFilePath);
  }

  console.log(`Published ${relativeFiles.length} static files to ${targetDirectoryPath}.`);
}

async function cleanupLegacyRootFiles(repositoryRoot, rootManifestPath) {
  const previousFiles = await readManifestFiles(rootManifestPath);

  for (const relativeFilePath of previousFiles) {
    const absoluteFilePath = resolve(repositoryRoot, relativeFilePath);
    await rm(absoluteFilePath, { force: true });
    await removeEmptyParentDirectories(dirname(absoluteFilePath), repositoryRoot);
  }

  await rm(rootManifestPath, { force: true });
}

async function collectRelativeFiles(directoryPath, sourceRoot = directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = resolve(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectRelativeFiles(entryPath, sourceRoot));
      continue;
    }

    files.push(normalizeSlashes(relative(sourceRoot, entryPath)));
  }

  return files.sort((left, right) => left.localeCompare(right));
}

async function readManifestFiles(rootManifestPath) {
  try {
    const manifestContents = await readFile(rootManifestPath, 'utf8');
    const parsedManifest = JSON.parse(manifestContents);

    return Array.isArray(parsedManifest.files)
      ? parsedManifest.files.filter((value) => typeof value === 'string')
      : [];
  } catch {
    return [];
  }
}

async function removeEmptyParentDirectories(directoryPath, repositoryRoot) {
  let currentDirectoryPath = directoryPath;

  while (currentDirectoryPath.startsWith(repositoryRoot) && currentDirectoryPath !== repositoryRoot) {
    const remainingEntries = await readdir(currentDirectoryPath);

    if (remainingEntries.length > 0) {
      return;
    }

    await rm(currentDirectoryPath, { recursive: true, force: true });
    currentDirectoryPath = dirname(currentDirectoryPath);
  }
}

function normalizeSlashes(filePath) {
  return filePath.replace(/\\/g, '/');
}

function normalizeBaseHref(indexContents) {
  if (indexContents.includes('<base href="')) {
    return indexContents.replace(/<base href="[^"]*"\s*\/?>(?=\s*)/, '<base href="./">');
  }

  return indexContents.replace('<head>', '<head><base href="./">');
}