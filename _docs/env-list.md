# Railway 환경변수 목록 (Primary 서비스)

> 값은 기록하지 않음. 키 이름만 관리.
> 실제 값은 Railway 대시보드 > Primary > Variables 에서 확인.

---

## n8n 시스템 설정

| 변수명 | 용도 |
|--------|------|
| N8N_HOST | n8n 호스트 주소 |
| N8N_PORT | n8n 포트 |
| N8N_PROTOCOL | http/https |
| N8N_EDITOR_BASE_URL | n8n 에디터 접속 URL |
| N8N_LISTEN_ADDRESS | 리스닝 주소 |
| N8N_ENCRYPTION_KEY | 크리덴셜 암호화 키 |
| N8N_OAUTH_CLIENT_ID | OAuth 클라이언트 ID |
| N8N_OAUTH_CLIENT_SECRET | OAuth 클라이언트 시크릿 |
| N8N_BLOCK_ENV_ACCESS_... | 환경변수 접근 차단 설정 |
| N8N_ENFORCE_SETTINGS_... | 설정 강제 적용 |
| N8N_ENV_VARS_EXPOSE | 환경변수 노출 설정 |
| N8N_RUNNERS_ENABLED | 러너 활성화 |
| EXECUTIONS_MODE | 실행 모드 (queue 등) |
| OFFLOAD_MANUAL_EXECU... | 수동 실행 오프로드 설정 |
| ENABLE_ALPINE_PRIVAT... | Alpine 프라이빗 설정 |
| NODE_OPTIONS | Node.js 옵션 |
| PORT | 서비스 포트 |

---

## 데이터베이스 (Postgres)

| 변수명 | 용도 |
|--------|------|
| DB_TYPE | DB 종류 (postgresdb) |
| DB_POSTGRESDB_HOST | Postgres 호스트 |
| DB_POSTGRESDB_PORT | Postgres 포트 |
| DB_POSTGRESDB_DATABASE | DB 이름 |
| DB_POSTGRESDB_USER | DB 사용자 |
| DB_POSTGRESDB_PASSWORD | DB 비밀번호 |

---

## Redis (Queue)

| 변수명 | 용도 |
|--------|------|
| QUEUE_BULL_REDIS_HOST | Redis 호스트 |
| QUEUE_BULL_REDIS_PORT | Redis 포트 |
| QUEUE_BULL_REDIS_PASSWORD | Redis 비밀번호 |
| QUEUE_BULL_REDIS_USER... | Redis 사용자 |
| QUEUE_BULL_REDIS_DUA... | Redis 듀얼 설정 |

---

## 연동 서비스

| 변수명 | 용도 |
|--------|------|
| GEMINI_API_KEY | Gemini API (KREAM 리셀 분석기) |
| TELEGRAM_BOT_TOKEN | Telegram 봇 (@mora_molt_helper_bot) |
| WEBHOOK_URL | n8n 웹훅 베이스 URL |

---

## 참고

- Google Sheets 크리덴셜은 Railway Variables가 아닌
  **n8n 내부 Credentials** 탭에서 관리됨
- Gmail 발송 크리덴셜도 동일하게 n8n Credentials에서 관리
