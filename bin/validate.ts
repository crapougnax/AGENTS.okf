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

  return result;
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

  console.log(`\n📊 Audit Summary: ${files.length} files scanned | ${totalErrors} errors | ${totalWarnings} warnings.`);

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
