import { NextRequest, NextResponse } from "next/server";
import { getJiraSession, jiraFetch, responseBody } from "@/lib/jira";

export const runtime = "nodejs";
// Jira's enhanced search endpoint rejects an ORDER BY-only (unbounded) query.
// This condition keeps the default list scoped to Jira issues with a project.
const DEFAULT_JQL = "project IS NOT EMPTY ORDER BY updated DESC";

export async function GET(request: NextRequest) {
  const session = await getJiraSession();
  if (!session) return NextResponse.json({ message: "Jira 로그인이 필요합니다." }, { status: 401 });
  const search = request.nextUrl.searchParams;
  const payload: Record<string, unknown> = { jql: search.get("jql")?.trim() || DEFAULT_JQL, maxResults: Number(search.get("limit") || 20), fields: ["summary", "status", "priority", "assignee", "reporter", "updated", "issuetype", "project"] };
  const nextPageToken = search.get("nextPageToken"); if (nextPageToken) payload.nextPageToken = nextPageToken;
  const response = await jiraFetch(session, "/rest/api/3/search/jql", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  return NextResponse.json(await responseBody(response), { status: response.status });
}

export async function POST(request: NextRequest) {
  const session = await getJiraSession();
  if (!session) return NextResponse.json({ message: "Jira 로그인이 필요합니다." }, { status: 401 });
  const body = await request.json() as { projectKey?: string; issueType?: string; summary?: string; description?: unknown };
  const projectKey = body.projectKey?.trim();
  const summary = body.summary?.trim();
  const issueType = body.issueType?.trim() || "Task";
  if (!projectKey || !summary) return NextResponse.json({ message: "프로젝트 키와 티켓 요약은 필수입니다." }, { status: 400 });
  const fields: Record<string, unknown> = { project: { key: projectKey }, issuetype: { name: issueType }, summary };
  if (body.description) fields.description = body.description;
  const response = await jiraFetch(session, "/rest/api/3/issue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields }) });
  return NextResponse.json(await responseBody(response), { status: response.status });
}
