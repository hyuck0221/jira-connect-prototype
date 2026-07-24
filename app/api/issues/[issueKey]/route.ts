import { NextRequest, NextResponse } from "next/server";
import { getJiraSession, getProjectScope, issueIsInProject, jiraFetch, projectMatchesScope, responseBody } from "@/lib/jira";

export const runtime = "nodejs";

async function sessionOrError() { const session = await getJiraSession(); return session; }

export async function GET(_: NextRequest, { params }: { params: Promise<{ issueKey: string }> }) {
  const session = await sessionOrError(); if (!session) return NextResponse.json({ message: "Jira 로그인이 필요합니다." }, { status: 401 });
  const projectId = await getProjectScope(); if (!projectId) return NextResponse.json({ message: "Jira 연계 관리에서 프로젝트 ID를 먼저 저장해 주세요." }, { status: 403 });
  const { issueKey } = await params;
  const response = await jiraFetch(session, `/rest/api/3/issue/${encodeURIComponent(issueKey)}?fields=summary,description,status,priority,assignee,reporter,updated,created,issuetype,project,comment`);
  const body = await responseBody(response) as { fields?: { project?: { id?: string; key?: string } } };
  if (response.ok && !projectMatchesScope(projectId, body.fields?.project)) return NextResponse.json({ message: "저장한 프로젝트 범위 밖의 티켓에는 접근할 수 없습니다." }, { status: 403 });
  return NextResponse.json(body, { status: response.status });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ issueKey: string }> }) {
  const session = await sessionOrError(); if (!session) return NextResponse.json({ message: "Jira 로그인이 필요합니다." }, { status: 401 });
  const projectId = await getProjectScope(); if (!projectId) return NextResponse.json({ message: "Jira 연계 관리에서 프로젝트 ID를 먼저 저장해 주세요." }, { status: 403 });
  const { issueKey } = await params;
  if (!(await issueIsInProject(session, issueKey, projectId))) return NextResponse.json({ message: "저장한 프로젝트 범위 밖의 티켓은 수정할 수 없습니다." }, { status: 403 });
  const incoming = await request.json() as { fields?: { summary?: unknown; description?: unknown } };
  const fields: Record<string, unknown> = {};
  if (typeof incoming.fields?.summary === "string") fields.summary = incoming.fields.summary;
  if (incoming.fields?.description !== undefined) fields.description = incoming.fields.description;
  if (!Object.keys(fields).length) return NextResponse.json({ message: "수정할 티켓 정보가 없습니다." }, { status: 400 });
  const response = await jiraFetch(session, `/rest/api/3/issue/${encodeURIComponent(issueKey)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields }) });
  if (response.status === 204) return NextResponse.json({ ok: true });
  return NextResponse.json(await responseBody(response), { status: response.status });
}
