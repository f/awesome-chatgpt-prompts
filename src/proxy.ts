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

  return NextResponse.next();
}

export const config = {
  matcher: ["/prompts/:path*"],
};
