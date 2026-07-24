import { NextRequest, NextResponse } from "next/server";
import { encodeSession, normalizeJiraSiteUrl, sessionCookie } from "@/lib/jira";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = request.cookies.get("jira-oauth-state")?.value;
  const requestedSiteUrl = normalizeJiraSiteUrl(request.cookies.get("jira-oauth-site")?.value ?? "");
  if (!code || !state || state !== expectedState) return NextResponse.redirect(new URL("/issues?error=oauth_state", request.url));
  const clientId = process.env.JIRA_CLIENT_ID; const clientSecret = process.env.JIRA_CLIENT_SECRET; const redirectUri = process.env.JIRA_OAUTH_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) return NextResponse.redirect(new URL("/issues?error=oauth_config", request.url));
  const tokenResponse = await fetch("https://auth.atlassian.com/oauth/token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ grant_type: "authorization_code", client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }), cache: "no-store" });
  if (!tokenResponse.ok) return NextResponse.redirect(new URL("/issues?error=oauth_token", request.url));
  const token = await tokenResponse.json() as { access_token: string };
  const resourceResponse = await fetch("https://api.atlassian.com/oauth/token/accessible-resources", { headers: { Authorization: `Bearer ${token.access_token}`, Accept: "application/json" }, cache: "no-store" });
  const resources = await resourceResponse.json() as Array<{ id: string; name: string; url?: string }>;
  const resource = resources.find((item) => normalizeJiraSiteUrl(item.url ?? "") === requestedSiteUrl);
  if (!resource) return NextResponse.redirect(new URL("/issues?error=site_not_authorized", request.url));
  const response = NextResponse.redirect(new URL("/issues?connected=1", request.url));
  response.cookies.set(sessionCookie.name, encodeSession({ accessToken: token.access_token, cloudId: resource.id, siteName: resource.name, siteUrl: requestedSiteUrl }), sessionCookie.options);
  response.cookies.delete("jira-oauth-state");
  response.cookies.delete("jira-oauth-site");
  return response;
}
