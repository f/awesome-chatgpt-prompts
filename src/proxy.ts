import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rewrite .prompt.md and .prompt.yml requests to the raw API route
  if (pathname.startsWith("/prompts/") && (pathname.endsWith(".prompt.md") || pathname.endsWith(".prompt.yml"))) {
    const id = pathname.slice("/prompts/".length);
    const url = request.nextUrl.clone();
    url.pathname = `/api/prompts/${id}/raw`;
    return NextResponse.rewrite(url);
  }

  // Rewrite machine-readable bot files to the bots API route
  if (pathname === "/bots.json") {
    const url = request.nextUrl.clone();
    url.pathname = "/api/bots";
    return NextResponse.rewrite(url);
  }
  const botFile = pathname.match(/^\/bots\/([A-Za-z0-9_-]+)(\.md|\.json|\/SKILL\.md)$/);
  if (botFile) {
    const [, slug, suffix] = botFile;
    const url = request.nextUrl.clone();
    url.pathname = `/api/bots/${slug}/${suffix === ".json" ? "json" : suffix === ".md" ? "md" : "skill"}`;
    return NextResponse.rewrite(url);
  }

  // Add pathname and query headers for layout detection
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-search", request.nextUrl.search);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
