import { NextResponse } from "next/server";
import { getJiraSession } from "@/lib/jira";

export async function GET() {
  const session = await getJiraSession();
  return NextResponse.json({ connected: Boolean(session), siteName: session?.siteName, siteUrl: session?.siteUrl });
}
