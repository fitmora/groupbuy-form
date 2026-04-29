# groupbuy-form — CLAUDE.md

> Claude Code가 이 저장소를 처음 열 때 반드시 읽는 컨텍스트 파일입니다.
> 마지막 업데이트: 2026-04-29

---

## 프로젝트 개요

**목적:** 특정 크루/커뮤니티 회원 전용 공동구매 폐쇄몰  
**운영 상태:** 실서비스 가동 중 + 병행 개발  
**운영 주체:** 주식회사 모라 (fitmora)  
**대표 도메인:** https://witee.co.kr/

---

## 저장소 구조

groupbuy-form/
├── _docs/                      ← 문서 폴더
│   ├── CLAUDE.md               ← 이 파일
│   ├── env-list.md             ← Railway 환경변수 키 목록
│   └── n8n-backup/             ← n8n 워크플로우 JSON 백업
│       ├── form-gateway.json
│       └── internal-processor.json
├── index.html                  ← 루트 메인 (목마교 공구)
├── index-closing.html          ← 공구 종료 안내
├── howto.jpg                   ← 주문 방법 안내 이미지
├── CNAME                       ← witee.co.kr 도메인 연결
├── minam/
│   ├── index.html              ← 미남 크루 전용
│   └── index-closed.html
└── ssdayseoul/
├── index.html              ← 썬데이서울 크루 전용
└── index-closing.html

**배포 방식:** GitHub Pages (witee.co.kr 연결)  
**브랜치:** main 단일 운영

---

## 기술 스택

| 레이어 | 구성 |
|--------|------|
| 프론트엔드 | 바닐라 HTML / CSS / JavaScript |
| 백엔드 | n8n (Railway 호스팅) |
| DB | Google Sheets (회원 목록 + 주문 기록) |
| 내부 DB | Postgres (n8n 내부용, 워크플로우 데이터) |
| 큐 | Redis (n8n 실행 큐) |
| 호스팅 | GitHub Pages |
| 외부 연동 | Daum Postcode API, Gmail, Kakao Open Chat |

---

## n8n 워크플로우 구조

### Railway 배포 정보
- **Primary URL:** `https://primary-production-97a64.up.railway.app`
- **구성:** Primary + Worker + Postgres + Redis (전체 Online)

### 워크플로우 1 — Form Gateway

**역할:** 인증 + 주문 검토 (2개 플로우가 1개 워크플로우 안에 존재)

**플로우 A — 회원 인증**

Webhook: Auth
→ GS: Check Member (Google Sheets에서 이름+인증번호로 조회)
→ IF: Is Member?
├── true  → Respond: Allowed
└── false → Respond: Denied

IF 조건:
- `$json.이름` is not empty (시트 조회 성공)
- AND `$json.소속` equals `$node["Webhook: Auth"].json.body.crew` (crew 일치)

**플로우 B — 주문 검토 (validate)**

Webhook1
→ Google Sheets (상품/가격 조회)
→ Flatten
→ HTTP Request
→ Price Parse & Merge
→ Finalize Response
→ Respond to Webhook1

### 워크플로우 2 — Internal Processor

**역할:** 최종 주문 접수 + 알림 + CRM 적재

Webhook
→ Normalize Submit Payload
→ Compose Order Summary
├── Build Rows (per item) → Append Order Rows (Google Sheets)
├── Admin message (Gmail)
├── IF: Has Buyer Email → Gmail: Send Order Confirmation
└── IF: 마케팅 동의? → WEECL_CRM 적재 (Google Sheets)

### 엔드포인트 정리

| 역할 | 경로 | 워크플로우 |
|------|------|-----------|
| 회원 인증 | `/webhook/member-auth` | Form Gateway (플로우 A) |
| 주문 검토 | `/webhook/groupbuy/validate` | Form Gateway (플로우 B) |
| 최종 주문 | `/webhook/internal-order-feed` | Internal Processor |

---

## 핵심 로직

### 인증 구조 (프론트 자립형 세션)
- 프론트는 `{ name, code, crew: currentCrew }` 3개를 n8n으로 전송
- n8n은 Google Sheets에서 이름+인증번호 조회 후 소속(crew) 일치 여부 검증
- **핵심:** 인증 성공 신호만 받으면 프론트가 `currentCrew`를 세션에 직접 저장
- 서버 응답의 crew 값을 믿지 않음 (데이터 오염 방어)
- 세션 TTL: 3600000ms (1시간), `sessionStorage` 사용

### 크루별 파일 분리 운영
- 각 크루는 독립 HTML 파일 보유
- `currentCrew` 변수만 다르고 나머지 로직 동일
- 현재 한계: 공지/할인율 변경 시 모든 크루 파일 수동 수정 필요

### 주문 2단계 구조
- 1단계: `/validate` → 배송비·총액 확인 화면 표시
- 2단계: 사용자 확인 후 `/internal-order-feed` → 실제 주문 접수

---

## 프론트엔드 주요 상수 (파일마다 다른 것 표시)

```javascript
const AUTH_URL     = 'https://primary-production-97a64.up.railway.app/webhook/member-auth';
const VALIDATE_URL = 'https://primary-production-97a64.up.railway.app/webhook/groupbuy/validate';
const SUBMIT_URL   = 'https://primary-production-97a64.up.railway.app/webhook/internal-order-feed';
const SESSION_TTL  = 3600000;
const currentCrew  = '목마교';  // ← 크루마다 다름. 이것만 교체하면 됨
```

---

## 운영 원칙

1. **실서비스 가동 중** — main 직접 수정 시 즉시 반영. 신중하게.
2. **n8n 워크플로우는 코드 외부** — 프론트 수정만으로 백엔드 동작 확인 불가
3. **Google Sheets가 사실상 회원 DB** — 스키마 변경 시 n8n과 반드시 동기화
4. **크루 추가 시** 기존 크루 폴더 복사 후 `currentCrew`만 교체

---

## 현재 상태 및 보류 항목

| 항목 | 상태 |
|------|------|
| 인증 3중 검증 (이름+인증번호+crew) | 확인 완료 ✅ |
| n8n 워크플로우 JSON 백업 | 완료 ✅ |
| Railway 환경변수 목록 문서화 | 완료 ✅ |
| 원 프론트 (크루 동적 렌더링) | 보류 |
| 관리자 백오피스 화면 | 보류 |
| 기업형 플랫폼 확장 | 보류 |

---

## 관련 문서

- `_docs/env-list.md` — Railway 환경변수 키 목록
- `_docs/n8n-backup/` — 워크플로우 JSON 백업
