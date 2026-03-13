import { NextResponse } from "next/server";

export async function GET() {
  const domain = process.env.EZOIC_SITE_DOMAIN;

  if (!domain) {
    return new NextResponse("# ads.txt not configured\n", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.redirect(
    `https://srv.adstxtmanager.com/19390/${domain}`,
    301
  );
}
