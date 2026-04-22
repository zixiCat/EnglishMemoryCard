import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const workspaceRoot = resolve(dirname(scriptPath), "..");
const exportScriptPath = resolve(
  workspaceRoot,
  "tools",
  "build-github-static.mjs",
);
const commitMessage = "docs: update static pages";

await runCommand(process.execPath, [exportScriptPath, "--publish-docs"]);

const statusResult = await runCommand("git", ["status", "--short"], {
  captureOutput: true,
});

if (!statusResult.stdout.trim()) {
  console.log(
    "No changes detected after exporting docs; skipping commit and push.",
  );
  process.exit(0);
}

await runCommand("git", ["add", "-A"]);
await runCommand("git", ["commit", "-m", commitMessage]);
await runCommand("git", ["push", "gh", "HEAD"]);

function runCommand(command, args, options = {}) {
  const { captureOutput = false } = options;

  return new Promise((resolveCommand, rejectCommand) => {
    const child = spawn(command, args, {
      cwd: workspaceRoot,
      env: process.env,
      stdio: captureOutput ? ["ignore", "pipe", "pipe"] : "inherit",
    });

    let stdout = "";
    let stderr = "";

    if (captureOutput) {
      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });
    }

    child.on("exit", (exitCode) => {
      if (exitCode === 0) {
        resolveCommand({ stdout, stderr });
        return;
      }

      rejectCommand(
        new Error(
          `${command} ${args.join(" ")} failed with exit code ${exitCode ?? "unknown"}.${stderr ? `\n${stderr.trim()}` : ""}`,
        ),
      );
    });

    child.on("error", rejectCommand);
  });
}
