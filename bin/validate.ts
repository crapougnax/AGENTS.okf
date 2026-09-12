#!/usr/bin/env bun
import { readdir, readFile, stat } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";

const CONTENT_ROOT = resolve(import.meta.dir, "../content");

interface ValidationResult {
  file: string;
  errors: string[];
  warnings: string[];
}

async function getAllMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function parseYamlFrontmatter(content: string): { frontmatter: Record<string, any> | null; body: string } {
  if (!content.startsWith("---")) {
    return { frontmatter: null, body: content };
  }

  const endIdx = content.indexOf("\n---", 3);
  if (endIdx === -1) {
    return { frontmatter: null, body: content };
  }

  const yamlRaw = content.substring(3, endIdx).trim();
  const body = content.substring(endIdx + 4).trim();
  const frontmatter: Record<string, any> = {};

  let currentKey = "";
  for (const line of yamlRaw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed.startsWith("- ") && currentKey) {
      if (!Array.isArray(frontmatter[currentKey])) {
        frontmatter[currentKey] = [];
      }
      frontmatter[currentKey].push(trimmed.substring(2).trim());
      continue;
    }

    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const key = line.substring(0, colonIdx).trim();
      const value = line.substring(colonIdx + 1).trim();
      currentKey = key;
      if (value) {
        frontmatter[key] = value;
      }
    }
  }

  return { frontmatter, body };
}

async function validateFile(filePath: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    file: filePath.replace(CONTENT_ROOT, "content"),
    errors: [],
    warnings: [],
  };

  const content = await readFile(filePath, "utf-8");
  const isIndex = filePath.endsWith("index.md");

  if (!isIndex) {
    const { frontmatter } = parseYamlFrontmatter(content);

    if (!frontmatter) {
      result.errors.push("Missing or malformed YAML frontmatter (must start with '---').");
      return result;
    }

    const mandatoryKeys = ["type", "title", "description", "tags", "timestamp", "category", "status"];
    for (const key of mandatoryKeys) {
      if (!frontmatter[key]) {
        result.errors.push(`Missing mandatory YAML field '${key}'.`);
      } else if (typeof frontmatter[key] === "string" && frontmatter[key].trim() === "") {
        result.errors.push(`Mandatory field '${key}' cannot be empty.`);
      }
    }

    if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
      result.errors.push("'tags' must be a YAML list of lowercase strings.");
    }
  }

  // Validate internal Markdown links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const targetUrl = match[2];
    if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://") || targetUrl.startsWith("#")) {
      continue;
    }

    let targetPath = "";
    if (targetUrl.startsWith("/")) {
      targetPath = join(CONTENT_ROOT, targetUrl);
    } else {
      targetPath = resolve(dirname(filePath), targetUrl);
    }

    // Check if target file or directory exists
    try {
      const s = await stat(targetPath);
      if (s.isDirectory()) {
        const indexFile = join(targetPath, "index.md");
        await stat(indexFile);
      }
    } catch {
      result.errors.push(`Broken link target '${targetUrl}' in markdown link [${match[1]}].`);
    }
  }

  // Detect machine-specific absolute file:// URIs (must never be committed)
  const absolutePathRegex = /file:\/\/\/Users\/|file:\/\/\/home\/|file:\/\/\/[A-Z]:\//gi;
  let absMatch;
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    while ((absMatch = absolutePathRegex.exec(lines[i])) !== null) {
      result.errors.push(`Machine-specific absolute path '${absMatch[0]}...' at line ${i + 1}. Use relative paths instead.`);
    }
  }

  // Detect proprietary client/project names that must not leak into public AGPL content
  const FORBIDDEN_NAMES = ["totalymage", "brados", "brad technology"];
  const lowerContent = content.toLowerCase();
  for (const name of FORBIDDEN_NAMES) {
    if (lowerContent.includes(name)) {
      result.errors.push(`Proprietary name '${name}' detected. Public AGPL content must use generic examples.`);
    }
  }

  return result;
}

async function validateSkillFile(filePath: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    file: filePath.replace(resolve(import.meta.dir, ".."), ""),
    errors: [],
    warnings: [],
  };

  const content = await readFile(filePath, "utf-8");

  // Skills use a minimal YAML frontmatter: name + description required
  if (!content.startsWith("---")) {
    result.errors.push("SKILL.md missing YAML frontmatter (must start with '---').");
    return result;
  }

  const { frontmatter } = parseYamlFrontmatter(content);
  if (!frontmatter) {
    result.errors.push("SKILL.md has malformed YAML frontmatter.");
    return result;
  }

  const requiredSkillKeys = ["name", "description"];
  for (const key of requiredSkillKeys) {
    if (!frontmatter[key] || (typeof frontmatter[key] === "string" && frontmatter[key].trim() === "")) {
      result.errors.push(`SKILL.md missing required frontmatter field '${key}'.`);
    }
  }

  // Validate internal links — also reject absolute file:// URIs
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const targetUrl = match[2];
    if (
      targetUrl.startsWith("http://") ||
      targetUrl.startsWith("https://") ||
      targetUrl.startsWith("#")
    ) {
      continue;
    }

    // file:// links are now errors — they should be relative
    if (targetUrl.startsWith("file://")) {
      result.errors.push(`Absolute file:// URI '${targetUrl}' in SKILL.md link [${match[1]}]. Use relative paths.`);
      continue;
    }

    const targetPath = resolve(dirname(filePath), targetUrl);
    try {
      const s = await stat(targetPath);
      if (s.isDirectory()) {
        await stat(join(targetPath, "index.md"));
      }
    } catch {
      result.errors.push(`Broken link target '${targetUrl}' in SKILL.md link [${match[1]}].`);
    }
  }

  // Detect machine-specific absolute file:// URIs outside of markdown links
  const absolutePathRegex = /file:\/\/\/Users\/|file:\/\/\/home\/|file:\/\/\/[A-Z]:\//gi;
  let absMatch;
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    while ((absMatch = absolutePathRegex.exec(lines[i])) !== null) {
      result.errors.push(`Machine-specific absolute path '${absMatch[0]}...' at line ${i + 1}. Use relative paths instead.`);
    }
  }

  // Detect proprietary client/project names
  const FORBIDDEN_NAMES = ["totalymage", "brados", "brad technology"];
  const lowerContent = content.toLowerCase();
  for (const name of FORBIDDEN_NAMES) {
    if (lowerContent.includes(name)) {
      result.errors.push(`Proprietary name '${name}' detected. Public AGPL content must use generic examples.`);
    }
  }

  return result;
}

async function getSkillFiles(skillsRoot: string): Promise<string[]> {
  const skillDirs = await readdir(skillsRoot, { withFileTypes: true });
  const skillFiles: string[] = [];
  for (const entry of skillDirs) {
    if (entry.isDirectory()) {
      const skillMd = join(skillsRoot, entry.name, "SKILL.md");
      try {
        await stat(skillMd);
        skillFiles.push(skillMd);
      } catch {
        // No SKILL.md in this directory — skip silently
      }
    }
  }
  return skillFiles;
}

async function main() {
  console.log("🔍 Auditing AGENTS.okf knowledge base conformance...\n");

  const files = await getAllMarkdownFiles(CONTENT_ROOT);
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of files) {
    const res = await validateFile(file);
    if (res.errors.length > 0) {
      totalErrors += res.errors.length;
      console.error(`❌ ${res.file}:`);
      for (const err of res.errors) {
        console.error(`   - Error: ${err}`);
      }
    } else {
      console.log(`✅ ${res.file}`);
    }
  }

  // Also validate skills/*/SKILL.md
  const SKILLS_ROOT = resolve(import.meta.dir, "../skills");
  try {
    const skillFiles = await getSkillFiles(SKILLS_ROOT);
    if (skillFiles.length > 0) {
      console.log("\n🛠️  Auditing operational skills SKILL.md conformance...\n");
      for (const skillFile of skillFiles) {
        const res = await validateSkillFile(skillFile);
        if (res.errors.length > 0) {
          totalErrors += res.errors.length;
          console.error(`❌ ${res.file}:`);
          for (const err of res.errors) {
            console.error(`   - Error: ${err}`);
          }
        } else {
          console.log(`✅ ${res.file}`);
        }
      }
    }
  } catch {
    // skills/ directory may not exist in minimal installations
  }

  console.log(`\n📊 Audit Summary: ${files.length} content files scanned | ${totalErrors} errors | ${totalWarnings} warnings.`);

  if (totalErrors > 0) {
    process.exit(1);
  } else {
    console.log("🎉 All documents strictly conform to OKF v0.1 specification!");
  }
}

main().catch((err) => {
  console.error("Fatal validation error:", err);
  process.exit(1);
});

