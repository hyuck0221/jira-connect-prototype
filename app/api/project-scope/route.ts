import { NextRequest, NextResponse } from "next/server";
import { isProjectIdentifier, JIRA_PROJECT_SCOPE } from "@/lib/jira";

export async function POST(request: NextRequest) {
  const { projectId } = await request.json() as { projectId?: string };
  const value = projectId?.trim() ?? "";
  if (!isProjectIdentifier(value)) return NextResponse.json({ message: "Jira 프로젝트 ID 또는 프로젝트 키를 입력해 주세요." }, { status: 400 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(JIRA_PROJECT_SCOPE, value, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}
