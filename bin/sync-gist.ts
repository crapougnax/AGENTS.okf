#!/usr/bin/env bun
import { spawn } from "node:child_process";
import { buildConsolidatedMarkdown } from "./build.ts";

const GIST_ID = "47971b85aa73dd702f4372a89858111c";
const GIST_FILENAME = "GEMINI_personal.md";

async function syncGist() {
  console.log("🔨 Compiling consolidated Markdown bundle from AGENTS.okf...");
  const content = await buildConsolidatedMarkdown();

  console.log(`📤 Updating Gist ${GIST_ID} (${GIST_FILENAME}) via gh CLI...`);

  const proc = spawn(
    "env",
    [
      "-u",
      "GH_TOKEN",
      "-u",
      "GITHUB_TOKEN",
      "gh",
      "gist",
      "edit",
      GIST_ID,
      "-f",
      GIST_FILENAME,
      "-",
    ],
    {
      shell: false,
      stdio: ["pipe", "inherit", "inherit"],
    }
  );

  proc.stdin.write(content);
  proc.stdin.end();

  await new Promise<void>((resolve, reject) => {
    proc.on("close", (code) => {
      if (code === 0) {
        console.log(`🎉 Successfully synchronized Gist: https://gist.github.com/crapougnax/${GIST_ID}`);
        resolve();
      } else {
        reject(new Error(`gh gist edit exited with code ${code}`));
      }
    });
    proc.on("error", reject);
  });
}

syncGist().catch((err) => {
  console.error("❌ Failed to synchronize Gist:", err);
  process.exit(1);
});
