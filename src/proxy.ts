import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rewrite .prompt.md and .prompt.yml requests to the raw API route
  if (pathname.startsWith("/prompts/") && (pathname.endsWith(".prompt.md") || pathname.endsWith(".prompt.yml"))) {
    const id = pathname.slice("/prompts/".length);
    const url = request.nextUrl.clone();
    url.pathname = `/api/prompts/${id}/raw`;
    return NextResponse.rewrite(url);
  }

  // Add pathname header for layout detection
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}


export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// 如果这个文件被 API 路由引用，并且你想让该路由在 Edge 环境运行：
export const runtime = 'edge';

// 注意：这里不要写 export const config = { matcher: [...] }
// 那个配置必须剪切并粘贴到你的 middleware.ts 文件中

;
