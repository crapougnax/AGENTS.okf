#!/usr/bin/env bun
import { copyFile, mkdir, readdir, readlink, symlink, unlink, writeFile, stat } from "node:fs/promises";
import { resolve, join, basename } from "node:path";
import { homedir } from "node:os";
import { buildGeminiRouter, buildClaudeRouter } from "./build.ts";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const REPO_ROOT = resolve(import.meta.dir, "..");
const HOME = homedir();

const GEMINI_DIR = join(HOME, ".gemini");
const GEMINI_SKILLS_DIR = join(GEMINI_DIR, "config", "skills");
const CLAUDE_DIR = join(HOME, ".claude");

const SKILLS_ROOT = join(REPO_ROOT, "skills");

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const VERBOSE = args.includes("-v") || args.includes("--verbose");

function log(msg: string) {
  console.log(`  ${msg}`);
}

function verbose(msg: string) {
  if (VERBOSE) console.log(`  ${msg}`);
}

function action(icon: string, msg: string) {
  console.log(`${icon} ${msg}`);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function isSymlink(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    // Use lstat to check symlink
    const { lstatSync } = await import("node:fs");
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
}

async function backupFile(filePath: string): Promise<void> {
  if (await exists(filePath)) {
    const backupPath = `${filePath}.bak`;
    if (!DRY_RUN) {
      await copyFile(filePath, backupPath);
    }
    verbose(`  ↳ Backed up ${basename(filePath)} → ${basename(backupPath)}`);
  }
}

async function writeFileSafe(filePath: string, content: string): Promise<void> {
  await backupFile(filePath);
  if (!DRY_RUN) {
    await writeFile(filePath, content, "utf-8");
  }
  log(`Wrote ${filePath}`);
}

// ---------------------------------------------------------------------------
// Step 1: Generate routers
// ---------------------------------------------------------------------------

async function generateRouters(): Promise<{ gemini: string; claude: string }> {
  action("🔨", "Generating LLM-specific routers...");
  const gemini = await buildGeminiRouter(REPO_ROOT);
  const claude = await buildClaudeRouter(REPO_ROOT);
  log(`Gemini router: ${gemini.split("\n").length} lines`);
  log(`Claude router: ${claude.split("\n").length} lines`);
  return { gemini, claude };
}

// ---------------------------------------------------------------------------
// Step 2: Deploy Gemini router
// ---------------------------------------------------------------------------

async function deployGemini(content: string): Promise<void> {
  action("🔵", "Deploying Gemini router...");

  if (!DRY_RUN) {
    await mkdir(GEMINI_DIR, { recursive: true });
  }

  const geminiMd = join(GEMINI_DIR, "GEMINI.md");
  const agentsMd = join(GEMINI_DIR, "AGENTS.md");

  await writeFileSafe(geminiMd, content);
  await writeFileSafe(agentsMd, content);
}

// ---------------------------------------------------------------------------
// Step 3: Deploy Claude router
// ---------------------------------------------------------------------------

async function deployClaude(content: string): Promise<void> {
  action("🟣", "Deploying Claude router...");

  if (!DRY_RUN) {
    await mkdir(CLAUDE_DIR, { recursive: true });
  }

  const claudeMd = join(CLAUDE_DIR, "CLAUDE.md");
  await writeFileSafe(claudeMd, content);
}

// ---------------------------------------------------------------------------
// Step 4: Symlink OKF skills
// ---------------------------------------------------------------------------

async function symlinkSkills(): Promise<void> {
  action("🔗", "Symlinking OKF skills...");

  if (!DRY_RUN) {
    await mkdir(GEMINI_SKILLS_DIR, { recursive: true });
  }

  // Discover skills with SKILL.md
  const skillEntries = await readdir(SKILLS_ROOT, { withFileTypes: true });
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const entry of skillEntries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;

    const skillName = entry.name;
    const skillSource = join(SKILLS_ROOT, skillName);
    const skillTarget = join(GEMINI_SKILLS_DIR, skillName);

    // Check if SKILL.md exists in the source
    if (!(await exists(join(skillSource, "SKILL.md")))) {
      verbose(`  ⏭ ${skillName}: no SKILL.md, skipping`);
      skipped++;
      continue;
    }

    // Check if target exists
    if (await exists(skillTarget)) {
      if (await isSymlink(skillTarget)) {
        // Already a symlink — check if it points to the right place
        try {
          const currentTarget = await readlink(skillTarget);
          if (currentTarget === skillSource) {
            verbose(`  ✓ ${skillName}: already linked correctly`);
            skipped++;
            continue;
          }
          // Points elsewhere — update
          if (!DRY_RUN) {
            await unlink(skillTarget);
            await symlink(skillSource, skillTarget);
          }
          log(`  ↻ ${skillName}: re-linked → ${skillSource}`);
          updated++;
        } catch {
          skipped++;
        }
      } else {
        // Real directory from another source — never touch
        verbose(`  ⚠ ${skillName}: real directory (not OKF), skipping`);
        skipped++;
      }
    } else {
      // Does not exist — create symlink
      if (!DRY_RUN) {
        await symlink(skillSource, skillTarget);
      }
      log(`  ➕ ${skillName}: linked → ${skillSource}`);
      created++;
    }
  }

  log(`Skills: ${created} created, ${updated} updated, ${skipped} skipped`);
}

// ---------------------------------------------------------------------------
// Step 5: Write version marker
// ---------------------------------------------------------------------------

async function writeVersionMarker(): Promise<void> {
  action("📌", "Writing version marker...");

  let version = "0.0.0";
  let commit = "unknown";

  try {
    const pkg = JSON.parse(await Bun.file(join(REPO_ROOT, "package.json")).text());
    version = pkg.version || version;
  } catch { /* ignore */ }

  try {
    const proc = Bun.spawn(["git", "rev-parse", "--short", "HEAD"], {
      cwd: REPO_ROOT,
      stdout: "pipe",
    });
    commit = (await new Response(proc.stdout).text()).trim() || commit;
  } catch { /* ignore */ }

  const marker = {
    version,
    commit,
    timestamp: new Date().toISOString(),
    repoRoot: REPO_ROOT,
  };

  const markerPath = join(GEMINI_DIR, ".okf-version");
  if (!DRY_RUN) {
    await writeFile(markerPath, JSON.stringify(marker, null, 2) + "\n", "utf-8");
  }
  log(`Version: v${version} (${commit}) → ${markerPath}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log(`\n🚀 AGENTS.okf — Local Deployment${DRY_RUN ? " (DRY RUN)" : ""}\n`);
  console.log(`   Source: ${REPO_ROOT}`);
  console.log(`   Gemini: ${GEMINI_DIR}`);
  console.log(`   Claude: ${CLAUDE_DIR}\n`);

  const { gemini, claude } = await generateRouters();
  await deployGemini(gemini);
  await deployClaude(claude);
  await symlinkSkills();
  await writeVersionMarker();

  console.log(`\n✅ Deployment complete.${DRY_RUN ? " (no files were modified)" : ""}\n`);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
