#!/usr/bin/env bun
/**
 * Quatrain Code Example Audit — Import Path Validator
 *
 * Scans OKF markdown fiches for TypeScript/JavaScript code blocks,
 * extracts import statements, and validates package specifiers against
 * the committed `known-packages.json` static registry.
 *
 * No local monorepo checkout required at audit time.
 * To refresh the registry: `bun run skills/quatrain-code-audit/scripts/update-registry.ts`
 *
 * Usage:
 *   bun run skills/quatrain-code-audit/scripts/audit-imports.ts [path/to/file.md]
 *
 * @license AGPL-3.0
 */

import { readdir, readFile, stat } from 'node:fs/promises'
import { join, resolve, relative } from 'node:path'

const REPO_ROOT = resolve(import.meta.dir, '..', '..', '..')
const CONTENT_ROOT = join(REPO_ROOT, 'content')
const REGISTRY_PATH = resolve(import.meta.dir, '..', 'known-packages.json')

interface ImportViolation {
   file: string
   line: number
   importPath: string
   suggestion?: string
}

/**
 * Loads the static known-packages.json registry and flattens all entries into a Set.
 */
async function loadKnownPackages(): Promise<{ all: Set<string>; sources: Record<string, string[]> }> {
   const raw = await readFile(REGISTRY_PATH, 'utf-8')
   const registry = JSON.parse(raw)
   const all = new Set<string>()
   const sources: Record<string, string[]> = {}

   for (const [key, value] of Object.entries(registry)) {
      if (key.startsWith('$') || key === 'generatedAt') continue
      const pkgs = value as string[]
      sources[key] = pkgs
      for (const pkg of pkgs) {
         all.add(pkg)
      }
   }

   return { all, sources }
}

/**
 * Extracts TypeScript/JavaScript fenced code blocks from markdown content.
 */
function extractCodeBlocks(content: string): Array<{ startLine: number; code: string }> {
   const blocks: Array<{ startLine: number; code: string }> = []
   const lines = content.split('\n')
   let inBlock = false
   let blockStart = 0
   let blockLines: string[] = []

   for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!inBlock && /^```(?:typescript|ts|javascript|js)\s*$/i.test(line.trim())) {
         inBlock = true
         blockStart = i + 1
         blockLines = []
      } else if (inBlock && line.trim() === '```') {
         blocks.push({ startLine: blockStart, code: blockLines.join('\n') })
         inBlock = false
         blockLines = []
      } else if (inBlock) {
         blockLines.push(line)
      }
   }

   return blocks
}

/**
 * Extracts import specifiers from a code block.
 */
function extractImports(code: string, blockStartLine: number): Array<{ line: number; specifier: string }> {
   const imports: Array<{ line: number; specifier: string }> = []
   const lines = code.split('\n')

   for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/(?:import\s+(?:\{[^}]*\}|[^{}\s]+)\s+from\s+['"]([^'"]+)['"])|(?:from\s+['"]([^'"]+)['"])/)
      if (match) {
         const specifier = match[1] || match[2]
         if (specifier) {
            imports.push({ line: blockStartLine + i + 1, specifier })
         }
      }
   }

   return imports
}

/**
 * Resolves a scoped package import to its base package name.
 */
function resolveBasePackage(specifier: string): string {
   if (specifier.startsWith('@')) {
      const parts = specifier.split('/')
      if (parts.length >= 2) {
         return `${parts[0]}/${parts[1]}`
      }
   }
   return specifier
}

/**
 * Finds the closest matching package name using substring heuristics.
 */
function findClosestMatch(target: string, known: Set<string>): string | undefined {
   const parts = target.split('/')
   if (parts.length < 2) return undefined

   const scope = parts[0]
   const name = parts[1]
   let best: string | undefined
   let bestScore = 0

   for (const pkg of known) {
      if (!pkg.startsWith(scope + '/')) continue
      const pkgName = pkg.split('/')[1]

      let score = 0
      const shorter = name.length < pkgName.length ? name : pkgName
      const longer = name.length < pkgName.length ? pkgName : name
      for (let i = 0; i < shorter.length; i++) {
         if (longer.includes(shorter.substring(0, i + 1))) {
            score = i + 1
         }
      }

      if (score > bestScore) {
         bestScore = score
         best = pkg
      }
   }

   return bestScore >= 3 ? best : undefined
}

async function auditFile(
   filePath: string,
   knownPackages: Set<string>,
): Promise<ImportViolation[]> {
   const violations: ImportViolation[] = []
   const content = await readFile(filePath, 'utf-8')
   const relPath = relative(REPO_ROOT, filePath)
   const blocks = extractCodeBlocks(content)

   for (const block of blocks) {
      const imports = extractImports(block.code, block.startLine)

      for (const imp of imports) {
         if (imp.specifier.startsWith('.') || imp.specifier.startsWith('/')) continue
         if (!imp.specifier.startsWith('@quatrain/') && !imp.specifier.startsWith('@bradtech')) continue

         const basePkg = resolveBasePackage(imp.specifier)
         if (!knownPackages.has(basePkg)) {
            const suggestion = findClosestMatch(basePkg, knownPackages)
            violations.push({
               file: relPath,
               line: imp.line,
               importPath: basePkg,
               suggestion,
            })
         }
      }
   }

   return violations
}

async function collectMarkdownFiles(dir: string): Promise<string[]> {
   const files: string[] = []
   const entries = await readdir(dir, { withFileTypes: true })
   for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
         files.push(...(await collectMarkdownFiles(fullPath)))
      } else if (entry.name.endsWith('.md')) {
         files.push(fullPath)
      }
   }
   return files
}

// ── Main ──

async function main() {
   console.log('🔬 Quatrain Code Example Audit — Import Path Validator\n')

   // 1. Load static registry
   console.log('📦 Loading known-packages.json registry...')
   const { all: allKnown, sources } = await loadKnownPackages()

   for (const [label, pkgs] of Object.entries(sources)) {
      console.log(`   ${label}: ${pkgs.length} packages`)
   }
   console.log(`   Total known: ${allKnown.size} packages\n`)

   // 2. Determine files to audit
   const targetArg = process.argv[2]
   let filesToAudit: string[]

   if (targetArg) {
      const targetPath = resolve(REPO_ROOT, targetArg)
      filesToAudit = [targetPath]
   } else {
      filesToAudit = await collectMarkdownFiles(CONTENT_ROOT)
   }

   console.log(`🔍 Scanning ${filesToAudit.length} markdown files for code examples...\n`)

   // 3. Audit all files
   let totalBlocks = 0
   let totalImports = 0
   const allViolations: ImportViolation[] = []

   for (const file of filesToAudit) {
      const content = await readFile(file, 'utf-8')
      const blocks = extractCodeBlocks(content)
      totalBlocks += blocks.length

      for (const block of blocks) {
         const imports = extractImports(block.code, block.startLine)
         totalImports += imports.length
      }

      const violations = await auditFile(file, allKnown)
      allViolations.push(...violations)
   }

   // 4. Report
   if (allViolations.length === 0) {
      console.log(`✅ All import paths are valid!`)
   } else {
      console.log(`❌ Found ${allViolations.length} invalid import path(s):\n`)
      for (const v of allViolations) {
         const suggestion = v.suggestion ? ` → Did you mean '${v.suggestion}'?` : ''
         console.log(`  ${v.file}:${v.line}`)
         console.log(`    ❌ '${v.importPath}' is not a known package.${suggestion}\n`)
      }
   }

   console.log(`\n📊 Audit Summary: ${filesToAudit.length} files | ${totalBlocks} code blocks | ${totalImports} imports | ${allViolations.length} errors`)

   if (allViolations.length > 0) {
      process.exit(1)
   }
}

main().catch((err) => {
   console.error('💥 Fatal audit error:', err)
   process.exit(1)
})
