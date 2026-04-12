import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 你的中间件逻辑
  return NextResponse.next()
}

// 可选：配置匹配路径
export const config = {
  matcher: '/api/:path*',
}
