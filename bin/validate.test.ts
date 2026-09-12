import { describe, it, expect } from "bun:test";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";

const CONTENT_ROOT = resolve(import.meta.dir, "../content");

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

function parseYamlFrontmatter(content: string) {
  if (!content.startsWith("---")) return null;
  const endIdx = content.indexOf("\n---", 3);
  if (endIdx === -1) return null;
  const yamlRaw = content.substring(3, endIdx).trim();
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
      if (value) frontmatter[key] = value;
    }
  }

  return frontmatter;
}

describe("AGENTS.okf Conformance Tests", async () => {
  const files = await getAllMarkdownFiles(CONTENT_ROOT);

  it("should contain markdown files in content/", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  for (const filePath of files) {
    const relPath = filePath.replace(CONTENT_ROOT, "content");
    const isIndex = filePath.endsWith("index.md");

    describe(`File: ${relPath}`, () => {
      it("should comply with OKF specifications and have valid internal links", async () => {
        const content = await readFile(filePath, "utf-8");

        if (!isIndex) {
          const fm = parseYamlFrontmatter(content);
          expect(fm).not.toBeNull();

          const mandatoryKeys = ["type", "title", "description", "tags", "timestamp", "category", "status"];
          for (const key of mandatoryKeys) {
            expect(fm?.[key]).toBeDefined();
            expect(fm?.[key]).not.toBe("");
          }
          expect(Array.isArray(fm?.tags)).toBe(true);
        }

        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match;
        while ((match = linkRegex.exec(content)) !== null) {
          const targetUrl = match[2];
          if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://") || targetUrl.startsWith("#")) {
            continue;
          }

          let targetPath = targetUrl.startsWith("/")
            ? join(CONTENT_ROOT, targetUrl)
            : resolve(dirname(filePath), targetUrl);

          let exists = true;
          try {
            const s = await stat(targetPath);
            if (s.isDirectory()) {
              await stat(join(targetPath, "index.md"));
            }
          } catch {
            exists = false;
          }

          expect({ link: match[1], url: targetUrl, exists }).toEqual({
            link: match[1],
            url: targetUrl,
            exists: true,
          });
        }
      });
    });
  }
});
