import { cookies } from "next/headers";

export const JIRA_SESSION = "jira-connect-session";
// Jira OAuth access tokens are short-lived. This prototype deliberately avoids
// persisting refresh tokens, so the browser session ends before token expiry.
const COOKIE_MAX_AGE = 60 * 50;

export type JiraSession = { accessToken: string; cloudId: string; siteName: string; siteUrl: string };

export function normalizeJiraSiteUrl(value: string) {
  try { return new URL(value).origin.replace(/\/$/, "").toLowerCase(); } catch { return ""; }
}

export async function getJiraSession(): Promise<JiraSession | null> {
  const value = (await cookies()).get(JIRA_SESSION)?.value;
  if (!value) return null;
  try { return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as JiraSession; } catch { return null; }
}

export function encodeSession(session: JiraSession) {
  return Buffer.from(JSON.stringify(session)).toString("base64url");
}

export const sessionCookie = {
  name: JIRA_SESSION,
  options: { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: COOKIE_MAX_AGE },
};

export async function jiraFetch(session: JiraSession, path: string, init?: RequestInit) {
  return fetch(`https://api.atlassian.com/ex/jira/${session.cloudId}${path}`, {
    ...init,
    headers: { Accept: "application/json", Authorization: `Bearer ${session.accessToken}`, ...init?.headers },
    cache: "no-store",
  });
}

export async function responseBody(response: Response) {
  const body = await response.text();
  try { return JSON.parse(body); } catch { return { message: body || "Jira API 요청에 실패했습니다." }; }
}
