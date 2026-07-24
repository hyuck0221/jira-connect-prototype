import { NextRequest, NextResponse } from "next/server";
import { getJiraSession, jiraFetch, responseBody } from "@/lib/jira";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ issueKey: string }> }) {
  const session = await getJiraSession(); if (!session) return NextResponse.json({ message: "Jira 로그인이 필요합니다." }, { status: 401 });
  const { issueKey } = await params;
  const response = await jiraFetch(session, `/rest/api/3/issue/${encodeURIComponent(issueKey)}/comment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) });
  return NextResponse.json(await responseBody(response), { status: response.status });
}
