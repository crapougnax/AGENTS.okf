#!/usr/bin/env bun
/**
 * Quatrain Code Example Audit — Import Path Validator
 *
 * Scans OKF markdown fiches for TypeScript/JavaScript code blocks,
 * extracts import statements, and validates package specifiers against
 * the real Quatrain Core and bradtech-oss monorepo registries.
 *
 * Usage:
 *   bun run skills/quatrain-code-audit/scripts/audit-imports.ts [path/to/file.md]
 *
 * @license AGPL-3.0
 */

import { readdir, readFile, stat } from 'node:fs/promises'
import { join, resolve, relative, dirname, basename } from 'node:path'

const REPO_ROOT = resolve(import.meta.dir, '..', '..', '..')
const CONTENT_ROOT = join(REPO_ROOT, 'content')

// Monorepo locations — discovered relative to CODE_ROOT (two levels above AGENTS.okf)
// Override with env vars QUATRAIN_CORE_PATH / BRADTECH_OSS_PATH for non-standard layouts
const CODE_ROOT = resolve(REPO_ROOT, '..', '..')
const QUATRAIN_CORE_PACKAGES = resolve(
   process.env.QUATRAIN_CORE_PATH || join(CODE_ROOT, 'QUATRAIN', 'Core'),
   'packages',
)
const BRADTECH_OSS_PACKAGES = resolve(
   process.env.BRADTECH_OSS_PATH || join(CODE_ROOT, 'BRAD2026', 'bradtech-oss'),
   'packages',
)

interface ImportViolation {
   file: string
   line: number
   importPath: string
   suggestion?: string
}

/**
 * Discovers all real package names from a monorepo packages/ directory.
 */
async function discoverPackageNames(packagesDir: string): Promise<Set<string>> {
   const names = new Set<string>()
   try {
      const entries = await readdir(packagesDir, { withFileTypes: true })
      for (const entry of entries) {
         if (!entry.isDirectory()) continue
         const pkgJsonPath = join(packagesDir, entry.name, 'package.json')
         try {
            const raw = await readFile(pkgJsonPath, 'utf-8')
            const pkg = JSON.parse(raw)
            if (pkg.name && typeof pkg.name === 'string') {
               names.add(pkg.name)
            }
         } catch {
            // No package.json or invalid — skip
         }
      }
   } catch {
      // Directory doesn't exist — skip
   }
   return names
}

/**
 * Extracts TypeScript/JavaScript fenced code blocks from markdown content.
 * Returns array of { startLine, code } tuples.
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
         blockStart = i + 1 // 0-indexed, next line is first code line
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
 * Matches: import { X } from 'pkg' and import X from 'pkg'
 */
function extractImports(code: string, blockStartLine: number): Array<{ line: number; specifier: string }> {
   const imports: Array<{ line: number; specifier: string }> = []
   const lines = code.split('\n')

   for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/(?:import\s+(?:\{[^}]*\}|[^{}\s]+)\s+from\s+['"]([^'"]+)['"])|(?:from\s+['"]([^'"]+)['"])/)
      if (match) {
         const specifier = match[1] || match[2]
         if (specifier) {
            imports.push({ line: blockStartLine + i + 1, specifier }) // 1-indexed
         }
      }
   }

   return imports
}

/**
 * Resolves a scoped package import to its base package name.
 * e.g. '@quatrain/queue-mqtt' stays as-is,
 *      '@quatrain/core/types' becomes '@quatrain/core'
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
         // Skip relative imports
         if (imp.specifier.startsWith('.') || imp.specifier.startsWith('/')) continue

         // Skip non-scoped third-party packages (dotenv, mqtt, etc.)
         if (!imp.specifier.startsWith('@quatrain/') && !imp.specifier.startsWith('@bradtech')) continue

         const basePkg = resolveBasePackage(imp.specifier)
         if (!knownPackages.has(basePkg)) {
            // Try to suggest a close match
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

/**
 * Finds the closest matching package name using simple substring/edit distance heuristics.
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

      // Simple common substring scoring
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

async function collectMarkdownFiles(dir: string): Promise<string[]> {
   const files: string[] = []
   const entries = await readdir(dir, { withFileTypes: true })
   for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
         files.push(...(await collectMarkdownFiles(fullPath)))
      } else if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
         files.push(fullPath)
      }
   }
   // Also check index.md files that might have code examples
   const indexPath = join(dir, 'index.md')
   try {
      await stat(indexPath)
      files.push(indexPath)
   } catch {
      // no index.md
   }
   return files
}

// ── Main ──

async function main() {
   console.log('🔬 Quatrain Code Example Audit — Import Path Validator\n')

   // 1. Build known package registry
   console.log('📦 Discovering package registries...')
   const quatrainPkgs = await discoverPackageNames(QUATRAIN_CORE_PACKAGES)
   const bradtechPkgs = await discoverPackageNames(BRADTECH_OSS_PACKAGES)
   const allKnown = new Set([...quatrainPkgs, ...bradtechPkgs])

   console.log(`   @quatrain/*: ${quatrainPkgs.size} packages`)
   console.log(`   @bradtech/*: ${bradtechPkgs.size} packages`)
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
