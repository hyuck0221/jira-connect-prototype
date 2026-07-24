"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/issues", label: "티켓 목록", icon: "▣" },
  { href: "/integration", label: "Jira 연계 관리", icon: "⌘" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className="app-shell">
    <aside className="sidebar">
      <Link className="brand" href="/issues"><span className="brand-mark">J</span><span>Jira Connect</span></Link>
      <nav aria-label="주요 메뉴">
        {navigation.map((item) => <Link className={`nav-link ${pathname === item.href ? "active" : ""}`} href={item.href} key={item.href}><span>{item.icon}</span>{item.label}</Link>)}
      </nav>
      <div className="sidebar-foot"><span className="status-dot" />Jira Cloud 연결 콘솔</div>
    </aside>
    <main className="main-content">{children}</main>
  </div>;
}
