#!/bin/bash
set -e

echo "🚀 Cloudflare Workers Deploy Script"
echo "======================================"

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

SERVER_DIR=".open-next/server-functions/default"

# --- Step 1: Build with OpenNext ---
echo ""
echo "📦 Step 1: Building with OpenNext..."
CLOUDFLARE=1 npx opennextjs-cloudflare build

# --- Step 2: Post-build cleanup ---
echo ""
echo "📦 Step 2: Post-build patches..."

# --- Step 2b: Patch handler.mjs for Next.js 16 compat ---
# OpenNext's loadManifest throws on manifests it doesn't recognize.
# Next.js 16 adds new manifests (prefetch-hints, subresource-integrity, fallback-build).
# Patch: return {} for unknown manifests instead of throwing.
HANDLER="$SERVER_DIR/handler.mjs"
if grep -q 'Unexpected loadManifest' "$HANDLER"; then
  sed -i '' 's|throw new Error(`Unexpected loadManifest(${path2}) call!`)|return{}|' "$HANDLER"
  echo "   ✅ Patched loadManifest to handle unknown Next.js 16 manifests"
fi


# --- Step 3: Stub heavy WASM/binary files to reduce bundle size ---
echo ""
echo "📦 Step 3: Stubbing heavy WASM files..."

# handler.mjs references files with absolute paths, causing wrangler's
# module collector to resolve them as: <server_dir>/<absolute_path>.
# We create stubs at both the normal and doubled path locations.
stub_wasm_file() {
  local REL_PATH="$1"
  local NORMAL="$SERVER_DIR/$REL_PATH"
  local DOUBLED="$SERVER_DIR$PROJECT_ROOT/$SERVER_DIR/$REL_PATH"

  for TARGET in "$NORMAL" "$DOUBLED"; do
    mkdir -p "$(dirname "$TARGET")"
    printf '\x00asm\x01\x00\x00\x00' > "$TARGET"
  done
}

stub_empty_file() {
  local REL_PATH="$1"
  local NORMAL="$SERVER_DIR/$REL_PATH"
  local DOUBLED="$SERVER_DIR$PROJECT_ROOT/$SERVER_DIR/$REL_PATH"

  for TARGET in "$NORMAL" "$DOUBLED"; do
    mkdir -p "$(dirname "$TARGET")"
    : > "$TARGET"
  done
}

# Stub @vercel/og WASM + fonts (saves ~1.5 MiB gzipped)
# Stub in .open-next bundle
stub_wasm_file "node_modules/next/dist/compiled/@vercel/og/resvg.wasm"
stub_empty_file "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf.bin"
stub_empty_file "node_modules/next/dist/compiled/@vercel/og/Geist-SemiBold.ttf.bin"
# Also stub in project root node_modules (wrangler resolves from here too)
REAL_RESVG="$PROJECT_ROOT/node_modules/next/dist/compiled/@vercel/og/resvg.wasm"
if [ -f "$REAL_RESVG" ] && [ "$(wc -c < "$REAL_RESVG")" -gt 100 ]; then
  cp "$REAL_RESVG" "$REAL_RESVG.bak"
  printf '\x00asm\x01\x00\x00\x00' > "$REAL_RESVG"
fi
echo "   ✅ Stubbed @vercel/og WASM + fonts"

# Keep Prisma WASM query engine (needed for query compilation with driver adapters)
# Aggressively clean @prisma to fit within 10 MiB:
PRISMA_RUNTIME="$SERVER_DIR/node_modules/@prisma/client/runtime"
PRISMA_CLIENT="$SERVER_DIR/node_modules/@prisma/client"
if [ -d "$PRISMA_RUNTIME" ]; then
  # Remove non-PostgreSQL engines
  find "$PRISMA_RUNTIME" -name "*cockroachdb*" -delete 2>/dev/null
  find "$PRISMA_RUNTIME" -name "*mysql*" -delete 2>/dev/null
  find "$PRISMA_RUNTIME" -name "*sqlite*" -delete 2>/dev/null
  find "$PRISMA_RUNTIME" -name "*sqlserver*" -delete 2>/dev/null
  # Remove source maps (not needed at runtime)
  find "$PRISMA_RUNTIME" -name "*.js.map" -delete 2>/dev/null
  find "$PRISMA_RUNTIME" -name "*.mjs.map" -delete 2>/dev/null
  # Remove duplicate .mjs versions of base64 WASM (keep only .js)
  rm -f "$PRISMA_RUNTIME"/query_engine_bg.postgresql.wasm-base64.mjs 2>/dev/null
  rm -f "$PRISMA_RUNTIME"/query_compiler_bg.postgresql.wasm-base64.mjs 2>/dev/null
  # Remove query compiler WASM (only query engine is needed for driver adapters)
  rm -f "$PRISMA_RUNTIME"/query_compiler_bg.postgresql.wasm-base64.js 2>/dev/null
  # Remove unused runtimes (we only use wasm-engine-edge)
  rm -f "$PRISMA_RUNTIME"/binary.js "$PRISMA_RUNTIME"/binary.mjs 2>/dev/null
  rm -f "$PRISMA_RUNTIME"/library.js "$PRISMA_RUNTIME"/library.mjs 2>/dev/null
  rm -f "$PRISMA_RUNTIME"/react-native.js 2>/dev/null
  rm -f "$PRISMA_RUNTIME"/wasm-compiler-edge.js "$PRISMA_RUNTIME"/wasm-compiler-edge.mjs 2>/dev/null
  rm -f "$PRISMA_RUNTIME"/edge-esm.js 2>/dev/null
  rm -f "$PRISMA_RUNTIME"/index-browser.js "$PRISMA_RUNTIME"/index-browser.mjs 2>/dev/null
  rm -f "$PRISMA_RUNTIME"/client.js "$PRISMA_RUNTIME"/client.mjs 2>/dev/null
  # Remove generator-build (not needed at runtime)
  rm -rf "$PRISMA_CLIENT/generator-build" 2>/dev/null
  echo "   ✅ Cleaned Prisma: kept only PostgreSQL WASM engine + wasm-engine-edge runtime"
fi

# --- Step 4: Check bundle size ---
echo ""
echo "📦 Step 4: Checking bundle size..."
npx wrangler deploy --dry-run --outdir /tmp/cf-dry-run 2>&1 | grep "Total Upload" || true

# --- Step 5: Deploy ---
echo ""
echo "📦 Step 5: Deploying to Cloudflare Workers..."
npx opennextjs-cloudflare deploy

# --- Step 6: Restore stubbed files in project root ---
REAL_RESVG="$PROJECT_ROOT/node_modules/next/dist/compiled/@vercel/og/resvg.wasm"
if [ -f "$REAL_RESVG.bak" ]; then
  mv "$REAL_RESVG.bak" "$REAL_RESVG"
  echo "   ✅ Restored project root resvg.wasm"
fi

echo ""
echo "✅ Deploy complete!"
