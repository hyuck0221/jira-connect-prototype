import { NextRequest, NextResponse } from "next/server";
import { getJiraSession, jiraFetch, responseBody } from "@/lib/jira";

export const runtime = "nodejs";

async function sessionOrError() { const session = await getJiraSession(); return session; }

export async function GET(_: NextRequest, { params }: { params: Promise<{ issueKey: string }> }) {
  const session = await sessionOrError(); if (!session) return NextResponse.json({ message: "Jira 로그인이 필요합니다." }, { status: 401 });
  const { issueKey } = await params;
  const response = await jiraFetch(session, `/rest/api/3/issue/${encodeURIComponent(issueKey)}?fields=summary,description,status,priority,assignee,reporter,updated,created,issuetype,project,comment`);
  return NextResponse.json(await responseBody(response), { status: response.status });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ issueKey: string }> }) {
  const session = await sessionOrError(); if (!session) return NextResponse.json({ message: "Jira 로그인이 필요합니다." }, { status: 401 });
  const { issueKey } = await params;
  const response = await jiraFetch(session, `/rest/api/3/issue/${encodeURIComponent(issueKey)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) });
  if (response.status === 204) return NextResponse.json({ ok: true });
  return NextResponse.json(await responseBody(response), { status: response.status });
}
