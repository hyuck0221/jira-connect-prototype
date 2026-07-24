"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "./app-shell";

type Connection = { siteUrl: string; apiKey: string; savedAt?: string };
const key = "jira-connect:connection";

export function IntegrationSettings() {
  const [connection, setConnection] = useState<Connection>({ siteUrl: "", apiKey: "" });
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setConnection(JSON.parse(stored));
  }, []);
  function save(event: FormEvent) {
    event.preventDefault();
    const value = { ...connection, siteUrl: connection.siteUrl.replace(/\/$/, ""), savedAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(value));
    void fetch("/api/auth/logout", { method: "POST" });
    setConnection(value); setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  }
  return <AppShell><section className="page-head"><p className="eyebrow">연동 설정</p><h1>Jira 연계 관리</h1><p>워크스페이스별 연결 정보를 저장하고, 사용자 Jira 계정을 연동하세요.</p></section>
    <div className="settings-grid"><form className="card settings-card" onSubmit={save}>
      <div className="card-title"><div><h2>워크스페이스 연결</h2><p>테스트용 연결 정보는 이 브라우저에만 저장됩니다.</p></div><span className="local-badge">Local storage</span></div>
      <label>Jira 사이트 주소<input required type="url" placeholder="https://team.atlassian.net" value={connection.siteUrl} onChange={(e) => setConnection({ ...connection, siteUrl: e.target.value })} /></label>
      <label>Space API Key<input required type="password" placeholder="테스트 API 키를 입력하세요" value={connection.apiKey} onChange={(e) => setConnection({ ...connection, apiKey: e.target.value })} /></label>
      <p className="form-note">이 프로토타입에서는 키를 서버로 전송하지 않으며, 동일 브라우저에서만 조회됩니다. 사이트를 변경해 저장하면 이전 OAuth 연결은 해제됩니다.</p>
      <button className="button primary" type="submit">{saved ? "저장되었습니다" : "연결 정보 저장"}</button>
      {connection.savedAt && <span className="saved-time">최근 저장: {new Date(connection.savedAt).toLocaleString("ko-KR")}</span>}
    </form>
    <section className="card oauth-card"><div className="card-title"><div><h2>사용자 OAuth 로그인</h2><p>각 사용자의 권한으로 Jira 티켓과 댓글을 불러옵니다.</p></div><span className="secure-badge">OAuth 2.0</span></div>
      <ol className="steps"><li><span>1</span>Atlassian 계정으로 로그인합니다.</li><li><span>2</span>접근할 Jira 사이트를 선택합니다.</li><li><span>3</span>내 권한 범위의 티켓을 조회하고 관리합니다.</li></ol>
      {connection.siteUrl ? <a className="button secondary" href={`/api/auth/login?siteUrl=${encodeURIComponent(connection.siteUrl)}`}>설정한 사이트로 Jira 계정 연결하기</a> : <button className="button secondary" type="button" disabled>먼저 Jira 사이트 주소를 저장하세요</button>}
      <p className="form-note">Vercel 환경 변수에 OAuth Client ID, Secret, Callback URL을 설정해야 합니다.</p>
    </section></div>
  </AppShell>;
}
