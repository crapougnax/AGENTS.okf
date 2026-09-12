#!/usr/bin/env bun
/**
 * Quatrain Code Audit — Registry Updater
 *
 * Scans local monorepo checkout directories to regenerate `known-packages.json`.
 * Run this when packages are added/removed/renamed in the source monorepos.
 *
 * Usage:
 *   bun run skills/quatrain-code-audit/scripts/update-registry.ts
 *
 * Environment variable overrides:
 *   QUATRAIN_CORE_PATH    — Path to Quatrain/Core root (default: ../../QUATRAIN/Core)
 *   QUATRAIN_COREUX_PATH  — Path to Quatrain/CoreUX root (default: ../../QUATRAIN/CoreUX)
 *   BRADTECH_OSS_PATH     — Path to bradtech-oss root (default: ../../BRAD2026/bradtech-oss)
 *
 * @license AGPL-3.0
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const REPO_ROOT = resolve(import.meta.dir, '..', '..', '..')
const CODE_ROOT = resolve(REPO_ROOT, '..', '..')
const REGISTRY_PATH = resolve(import.meta.dir, '..', 'known-packages.json')

interface RegistrySource {
   label: string
   packagesDir: string
}

const sources: RegistrySource[] = [
   {
      label: 'quatrain-core',
      packagesDir: join(
         process.env.QUATRAIN_CORE_PATH || join(CODE_ROOT, 'QUATRAIN', 'Core'),
         'packages',
      ),
   },
   {
      label: 'quatrain-coreux',
      packagesDir: join(
         process.env.QUATRAIN_COREUX_PATH || join(CODE_ROOT, 'QUATRAIN', 'CoreUX'),
         'packages',
      ),
   },
   {
      label: 'bradtech-oss',
      packagesDir: join(
         process.env.BRADTECH_OSS_PATH || join(CODE_ROOT, 'BRAD2026', 'bradtech-oss'),
         'packages',
      ),
   },
]

async function discoverPackages(packagesDir: string): Promise<string[]> {
   const names: string[] = []
   try {
      const entries = await readdir(packagesDir, { withFileTypes: true })
      for (const entry of entries) {
         if (!entry.isDirectory()) continue
         const pkgJsonPath = join(packagesDir, entry.name, 'package.json')
         try {
            const raw = await readFile(pkgJsonPath, 'utf-8')
            const pkg = JSON.parse(raw)
            if (pkg.name && typeof pkg.name === 'string') {
               names.push(pkg.name)
            }
         } catch {
            // Skip invalid entries
         }
      }
   } catch (err: any) {
      console.warn(`⚠️  Could not scan ${packagesDir}: ${err.message}`)
   }
   return names.sort()
}

async function main() {
   console.log('🔄 Updating known-packages.json registry...\n')

   const registry: Record<string, any> = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $comment: 'Auto-generated package registry for quatrain-code-audit. Run `bun run skills/quatrain-code-audit/scripts/update-registry.ts` to refresh.',
      generatedAt: new Date().toISOString(),
   }

   let total = 0
   for (const source of sources) {
      const packages = await discoverPackages(source.packagesDir)
      registry[source.label] = packages
      console.log(`   ${source.label}: ${packages.length} packages (${source.packagesDir})`)
      total += packages.length
   }

   await writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n', 'utf-8')
   console.log(`\n✅ Registry updated: ${total} packages written to known-packages.json`)
}

main().catch((err) => {
   console.error('💥 Registry update failed:', err)
   process.exit(1)
})
