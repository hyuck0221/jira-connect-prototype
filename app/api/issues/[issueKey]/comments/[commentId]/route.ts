import { NextRequest, NextResponse } from "next/server";
import { getJiraSession, getProjectScope, issueIsInProject, jiraFetch, responseBody } from "@/lib/jira";

export const runtime = "nodejs";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ issueKey: string; commentId: string }> }) {
  const session = await getJiraSession(); if (!session) return NextResponse.json({ message: "Jira 로그인이 필요합니다." }, { status: 401 });
  const projectId = await getProjectScope(); if (!projectId) return NextResponse.json({ message: "Jira 연계 관리에서 프로젝트 ID를 먼저 저장해 주세요." }, { status: 403 });
  const { issueKey, commentId } = await params;
  if (!(await issueIsInProject(session, issueKey, projectId))) return NextResponse.json({ message: "저장한 프로젝트 범위 밖의 티켓 댓글은 수정할 수 없습니다." }, { status: 403 });
  const response = await jiraFetch(session, `/rest/api/3/issue/${encodeURIComponent(issueKey)}/comment/${encodeURIComponent(commentId)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) });
  return NextResponse.json(await responseBody(response), { status: response.status });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ issueKey: string; commentId: string }> }) {
  const session = await getJiraSession(); if (!session) return NextResponse.json({ message: "Jira 로그인이 필요합니다." }, { status: 401 });
  const projectId = await getProjectScope(); if (!projectId) return NextResponse.json({ message: "Jira 연계 관리에서 프로젝트 ID를 먼저 저장해 주세요." }, { status: 403 });
  const { issueKey, commentId } = await params;
  if (!(await issueIsInProject(session, issueKey, projectId))) return NextResponse.json({ message: "저장한 프로젝트 범위 밖의 티켓 댓글은 삭제할 수 없습니다." }, { status: 403 });
  const response = await jiraFetch(session, `/rest/api/3/issue/${encodeURIComponent(issueKey)}/comment/${encodeURIComponent(commentId)}`, { method: "DELETE" });
  if (response.status === 204) return NextResponse.json({ ok: true });
  return NextResponse.json(await responseBody(response), { status: response.status });
}
