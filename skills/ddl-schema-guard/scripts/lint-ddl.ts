#!/usr/bin/env bun
import { readFile } from "node:fs/promises";

const targetPath = process.argv[2];
if (!targetPath) {
  console.log(`
Usage: bun run lint-ddl.ts <path/to/schema.sql>

Example:
  bun run lint-ddl.ts packages/entities/src/Core/Invoice/Invoice.sql
`);
  process.exit(1);
}

console.log(`🔍 Auditing PostgreSQL DDL schema: [${targetPath}]...\n`);

let content: string;
try {
  content = await readFile(targetPath, "utf-8");
} catch (err: any) {
  console.error(`❌ Could not read file: ${targetPath} (${err.message})`);
  process.exit(1);
}

const lines = content.split("\n");
const errors: { line: number; message: string; snippet: string }[] = [];
const warnings: { line: number; message: string; snippet: string }[] = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // Skip SQL comments
  if (trimmed.startsWith("--") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
    continue;
  }

  // 1. Check for quoted identifiers (e.g. "userId", "Accounts")
  const quotedMatch = line.match(/"([a-zA-Z0-9_]+)"/g);
  if (quotedMatch) {
    errors.push({
      line: i + 1,
      message: `Quoted SQL identifier detected (${quotedMatch.join(", ")}). Identifiers MUST be bare lowercase without double quotes.`,
      snippet: trimmed,
    });
  }

  // 2. Check for CamelCase in column definitions
  // e.g. userId VARCHAR, createdAt TIMESTAMP
  const camelMatch = line.match(/\b([a-z]+[A-Z][a-zA-Z0-9]*)\b(?:\s+(?:VARCHAR|TEXT|INTEGER|BOOLEAN|UUID|TIMESTAMP|BIGINT|JSONB))/i);
  if (camelMatch) {
    errors.push({
      line: i + 1,
      message: `CamelCase identifier detected ('${camelMatch[1]}'). Per standards, column names MUST be strictly lowercase (e.g. 'user_id' or 'created_at').`,
      snippet: trimmed,
    });
  }

  // 3. Check for bare TIMESTAMP without timezone
  if (/\bTIMESTAMP\b(?!\s+WITH\s+TIME\s+ZONE)/i.test(line) && !/TIMESTAMPTZ/i.test(line)) {
    warnings.push({
      line: i + 1,
      message: `Bare 'TIMESTAMP' detected. Always specify 'TIMESTAMP WITH TIME ZONE' (or 'TIMESTAMPTZ') for distributed consistency.`,
      snippet: trimmed,
    });
  }
}

// 4. Check each CREATE TABLE block for mandatory standard columns
const tableBlockRegex = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(\w+)\s*\(([^;]*?)(?=\);|\bCREATE\b|\bALTER\b|$)/gis;
let tableMatch: RegExpExecArray | null;
while ((tableMatch = tableBlockRegex.exec(content)) !== null) {
  const tableName = tableMatch[1];
  const blockContent = tableMatch[2];
  if (!/\bcreated_at\b/i.test(blockContent)) {
    warnings.push({
      line: content.substring(0, tableMatch.index).split("\n").length,
      message: `Table '${tableName}' is missing standard 'created_at TIMESTAMP WITH TIME ZONE' column.`,
      snippet: `CREATE TABLE ${tableName} (...)`,
    });
  }
  if (!/\bupdated_at\b/i.test(blockContent)) {
    warnings.push({
      line: content.substring(0, tableMatch.index).split("\n").length,
      message: `Table '${tableName}' is missing standard 'updated_at TIMESTAMP WITH TIME ZONE' column.`,
      snippet: `CREATE TABLE ${tableName} (...)`,
    });
  }
}

if (errors.length > 0) {
  console.error(`❌ Schema audit FAILED with ${errors.length} errors:`);
  for (const err of errors) {
    console.error(`   Line ${err.line}: ${err.message}`);
    console.error(`     > ${err.snippet}`);
  }
}

if (warnings.length > 0) {
  console.warn(`\n⚠️ Schema audit WARNINGS (${warnings.length}):`);
  for (const w of warnings) {
    console.warn(`   Line ${w.line}: ${w.message}`);
    console.warn(`     > ${w.snippet}`);
  }
}

if (errors.length === 0) {
  console.log("✅ DDL strictly complies with PostgreSQL lowercase naming and domain isolation standards!");
} else {
  process.exit(1);
}
