import { NextResponse } from "next/server";
import { sessionCookie } from "@/lib/jira";

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie.name, "", { ...sessionCookie.options, maxAge: 0 });
  return response;
}
