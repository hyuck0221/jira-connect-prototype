import { NextRequest, NextResponse } from "next/server";
import { getJiraSession, getProjectScope, jiraFetch, responseBody } from "@/lib/jira";

export const runtime = "nodejs";
function scopedJql(projectId: string, rawJql: string | null) {
  const jql = rawJql?.trim();
  if (!jql) return `project = ${projectId} ORDER BY updated DESC`;
  const match = jql.match(/^(.*?)(\s+ORDER\s+BY\s+.+)$/i);
  const filter = match?.[1].trim() || "project IS NOT EMPTY";
  return `project = ${projectId} AND (${filter})${match?.[2] ?? " ORDER BY updated DESC"}`;
}

export async function GET(request: NextRequest) {
  const session = await getJiraSession();
  if (!session) return NextResponse.json({ message: "Jira 로그인이 필요합니다." }, { status: 401 });
  const projectId = await getProjectScope();
  if (!projectId) return NextResponse.json({ message: "Jira 연계 관리에서 프로젝트 ID를 먼저 저장해 주세요." }, { status: 403 });
  const search = request.nextUrl.searchParams;
  const payload: Record<string, unknown> = { jql: scopedJql(projectId, search.get("jql")), maxResults: Number(search.get("limit") || 20), fields: ["summary", "status", "priority", "assignee", "reporter", "updated", "issuetype", "project"] };
  const nextPageToken = search.get("nextPageToken"); if (nextPageToken) payload.nextPageToken = nextPageToken;
  const response = await jiraFetch(session, "/rest/api/3/search/jql", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  return NextResponse.json(await responseBody(response), { status: response.status });
}

export async function POST(request: NextRequest) {
  const session = await getJiraSession();
  if (!session) return NextResponse.json({ message: "Jira 로그인이 필요합니다." }, { status: 401 });
  const projectId = await getProjectScope();
  if (!projectId) return NextResponse.json({ message: "Jira 연계 관리에서 프로젝트 ID를 먼저 저장해 주세요." }, { status: 403 });
  const body = await request.json() as { issueType?: string; summary?: string; description?: unknown };
  const summary = body.summary?.trim();
  const issueType = body.issueType?.trim() || "Task";
  if (!summary) return NextResponse.json({ message: "티켓 요약은 필수입니다." }, { status: 400 });
  const project = /^\d+$/.test(projectId) ? { id: projectId } : { key: projectId };
  const fields: Record<string, unknown> = { project, issuetype: { name: issueType }, summary };
  if (body.description) fields.description = body.description;
  const response = await jiraFetch(session, "/rest/api/3/issue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields }) });
  return NextResponse.json(await responseBody(response), { status: response.status });
}
