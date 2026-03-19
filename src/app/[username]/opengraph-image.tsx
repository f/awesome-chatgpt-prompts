// OG image generation disabled for Cloudflare Workers (resvg.wasm too large)
// Falls back to static og.png from the public directory
export default function OGImage() {
  return new Response(null, { status: 302, headers: { Location: "/og.png" } });
}
