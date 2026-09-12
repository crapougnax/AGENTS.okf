#!/usr/bin/env bash
# AGENTS.okf — Tycho Knowledge Package Post-Install Hook
# Runs after Tycho fetches the package content to ~/.tycho/knowledge/agents-okf/
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# The repo root is 3 levels up from .tycho/knowledge/agents-okf/
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

echo "📦 AGENTS.okf — Post-Install"
echo "   Package: $SCRIPT_DIR"
echo "   Repo:    $REPO_ROOT"

# ---------------------------------------------------------------------------
# 1. Check bun availability
# ---------------------------------------------------------------------------
if ! command -v bun &>/dev/null; then
    echo ""
    echo "⚠️  bun is required but not found."
    echo "   Install: curl -fsSL https://bun.sh/install | bash"
    echo ""
    echo "   After installing bun, run manually:"
    echo "     cd $REPO_ROOT && bun run build && bun run sync:local"
    exit 1
fi

# ---------------------------------------------------------------------------
# 2. Build LLM-specific routers
# ---------------------------------------------------------------------------
echo ""
echo "🔨 Building LLM routers..."
cd "$REPO_ROOT"
bun run build

# ---------------------------------------------------------------------------
# 3. Deploy to local agent config directories
# ---------------------------------------------------------------------------
echo ""
echo "🚀 Deploying to local LLM config directories..."
bun run sync:local

echo ""
echo "✅ AGENTS.okf knowledge package installed successfully."
