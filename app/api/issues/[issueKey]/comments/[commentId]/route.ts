import { NextRequest, NextResponse } from "next/server";
import { getJiraSession, jiraFetch, responseBody } from "@/lib/jira";

export const runtime = "nodejs";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ issueKey: string; commentId: string }> }) {
  const session = await getJiraSession(); if (!session) return NextResponse.json({ message: "Jira 로그인이 필요합니다." }, { status: 401 });
  const { issueKey, commentId } = await params;
  const response = await jiraFetch(session, `/rest/api/3/issue/${encodeURIComponent(issueKey)}/comment/${encodeURIComponent(commentId)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) });
  return NextResponse.json(await responseBody(response), { status: response.status });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ issueKey: string; commentId: string }> }) {
  const session = await getJiraSession(); if (!session) return NextResponse.json({ message: "Jira 로그인이 필요합니다." }, { status: 401 });
  const { issueKey, commentId } = await params;
  const response = await jiraFetch(session, `/rest/api/3/issue/${encodeURIComponent(issueKey)}/comment/${encodeURIComponent(commentId)}`, { method: "DELETE" });
  if (response.status === 204) return NextResponse.json({ ok: true });
  return NextResponse.json(await responseBody(response), { status: response.status });
}
