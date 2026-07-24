# Jira Connect Prototype

Jira Cloud의 OAuth 2.0 (3LO) 사용자 로그인을 통해 티켓 조회·생성·수정, 상세, 댓글 CRUD를 제공하는 Vercel 배포용 Next.js 프로토타입입니다.

## 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Atlassian OAuth 설정

Atlassian Developer Console에서 OAuth 2.0 (3LO) 앱을 만들고 아래 값을 Vercel 환경 변수와 `.env.local`에 설정합니다.

| 변수 | 설명 |
| --- | --- |
| `JIRA_CLIENT_ID` | Atlassian OAuth Client ID |
| `JIRA_CLIENT_SECRET` | Atlassian OAuth Client Secret |
| `JIRA_OAUTH_REDIRECT_URI` | `https://배포도메인/api/auth/callback` |

OAuth 권한 범위는 `read:jira-work write:jira-work delete:comment:jira offline_access`를 요청합니다. 사용자는 로그인 중 Jira 사이트 접근을 승인하며, 앱은 선택 가능한 첫 번째 Cloud 사이트에 연결합니다.

## 배포

Git 저장소를 Vercel에 연결한 뒤 위 3개 환경 변수를 등록하면 됩니다. 별도 데이터베이스가 필요하지 않습니다. OAuth 액세스 토큰은 만료 전에 약 50분 동안 HttpOnly 세션 쿠키에만 보관하고, 연계 관리 화면의 사이트 주소·테스트 Space API Key는 요청대로 사용자 브라우저 `localStorage`에만 저장합니다.

> 프로덕션에서는 API Key를 localStorage에 저장하지 않는 것을 권장합니다. 이 동작은 본 프로토타입의 테스트 요구사항에 맞춘 것입니다.
