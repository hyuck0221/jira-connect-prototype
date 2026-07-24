import { NextResponse } from "next/server";
import { normalizeJiraSiteUrl } from "@/lib/jira";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const clientId = process.env.JIRA_CLIENT_ID;
  const redirectUri = process.env.JIRA_OAUTH_REDIRECT_URI;
  if (!clientId || !redirectUri) return NextResponse.redirect(new URL("/issues?error=oauth_config", request.url));
  const requestedSiteUrl = normalizeJiraSiteUrl(new URL(request.url).searchParams.get("siteUrl") ?? "");
  if (!requestedSiteUrl) return NextResponse.redirect(new URL("/issues?error=site_required", request.url));
  const state = crypto.randomUUID();
  const url = new URL("https://auth.atlassian.com/authorize");
  url.search = new URLSearchParams({ audience: "api.atlassian.com", client_id: clientId, scope: "read:jira-work write:jira-work delete:comment:jira offline_access", redirect_uri: redirectUri, state, response_type: "code", prompt: "consent" }).toString();
  const response = NextResponse.redirect(url);
  response.cookies.set("jira-oauth-state", state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
  response.cookies.set("jira-oauth-site", requestedSiteUrl, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
  return response;
}
