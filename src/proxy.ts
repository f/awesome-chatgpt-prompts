import { NextRequest, NextResponse } from "next/server";

// 确保没有任何 export const ... 变量
// 只有一个逻辑导出函数
export async function proxy(request: NextRequest) {
  console.log("Proxy tool triggered");
  return NextResponse.next();
};
