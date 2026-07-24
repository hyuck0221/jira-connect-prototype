import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jira Connect",
  description: "Jira 업무를 한 곳에서 조회하고 관리하는 연결 콘솔",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
