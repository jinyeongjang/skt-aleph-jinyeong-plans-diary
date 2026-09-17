# 📔 SKT ALEPH 과제 6 & 7: 플랜두씨 다이어리 1 & 2 (Plan-Do-See Diary)

> **SKT ALEPH 과제 6 & 과제 7 통합 구현체**:  
> 계획(Plan) ➔ 실제로 한 일(Do) ➔ 돌아보기(See)로 이어지는 다이어리 웹에 **PBKDF2-SHA256 단방향 암호화 인증**, **Bearer JWT 세션 관리**, **멀티테넌트 데이터 완벽 격리(IDOR 방어)** 및 **5일 연속 관찰 기록과 3일차 계획 규칙 변경**을 적용하고, 이를 검증하는 **인증 구현 설명서 6대 항목**과 **사전 고정 20대 자동화 검사(20/20 PASS)**를 완비한 프로젝트입니다.

---

<div align="center">

[![Deployment](https://img.shields.io/badge/Deployment-Vercel_Live-brightgreen?style=for-the-badge&logo=vercel)](https://skt-aleph-jinyeong-plans-diary.vercel.app)
[![Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/jinyeongjang/skt-aleph-jinyeong-plans-diary)
[![Tests](<https://img.shields.io/badge/20_Fixed_Tests-20%2F20_PASS_(100%25)-brightgreen?style=for-the-badge&logo=vitest>)](scripts/run-tests.ts)
[![Auth](https://img.shields.io/badge/Authentication-PBKDF2--SHA256_&_JWT-orange?style=for-the-badge&logo=jsonwebtokens)](src/services/authService.ts)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL_RLS-3ecf8e?style=for-the-badge&logo=supabase)](database/schema.sql)
[![Schema](https://img.shields.io/badge/Schema_Contract-pds--schema--v2.json-blue?style=for-the-badge)](contracts/pds-schema-v2.json)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## 📌 목차 (Table of Contents)

1. [과제 6 & 과제 7 공식 제출 정보](#1-과제-6--과제-7-공식-제출-정보)
2. [짧은 확인 방법 4줄 (T07-C39 / T06-C59)](#2-짧은-확인-방법-4줄-t07-c39--t06-c59)
3. [AI와 나의 판단 3줄 (T07-C40 / T06-C60)](#3-ai와-나의-판단-3줄-t07-c40--t06-c60)
4. [인증 구현 설명서 6대 항목 (T07-C127 ~ T07-C131)](#4-인증-구현-설명서-6대-항목-t07-c127--t07-c131)
5. [5일 연속 관찰 기록 & 3일차 계획 규칙 변경 명세 (T07-C04 ~ T07-C27, T07-C132)](#5-5일-연속-관찰-기록--3일차-계획-규칙-변경-명세-t07-c04--t07-c27-t07-c132)
6. [시스템 아키텍처 및 멀티테넌트 보안 격리 모델](#6-시스템-아키텍처-및-멀티테넌트-보안-격리-모델)
7. [데이터베이스 ERD 및 스키마 명세](#7-데이터베이스-erd-및-스키마-명세)
8. [사전 고정 20대 자동화 검사 전수 검증 결과 (20/20 PASS)](#8-사전-고정-20대-자동화-검사-전수-검증-결과-2020-pass)
9. [로컬 실행 및 Supabase / Vercel 배포 가이드](#9-로컬-실행-및-supabase--vercel-배포-가이드)
10. [과제 통과 기준(T06-C01 ~ C83 & T07-C01 ~ C134) 매트릭스](#10-과제-통과-기준t06-c01--c83--t07-c01--c134-매트릭스)

---

## 1. 과제 6 & 과제 7 공식 제출 정보

- **공개 결과물 주소**: [https://skt-aleph-jinyeong-plans-diary.vercel.app](https://skt-aleph-jinyeong-plans-diary.vercel.app)
- **GitHub 오픈 소스 저장소**: [https://github.com/jinyeongjang/skt-aleph-jinyeong-plans-diary](https://github.com/jinyeongjang/skt-aleph-jinyeong-plans-diary)
- **과제 계승 및 커밋 조상 (T07-C77, T07-C78)**: 본 저장소는 과제 6의 최종 제출 커밋을 그대로 조상(Ancestor)으로 유지하며, 과제 7 인증/격리/관찰 기능을 안전하게 추가 구현하였습니다.
- **첫 화면 공개 접근성 (T07-C01, T07-C03)**:
  - 브라우저 새 시크릿 창(Incognito)에서 계정 생성, 로그인, 인증, 비밀번호 입력 없이 누구나 첫 화면(로그인 랜딩 뷰 및 1-클릭 데모 계정 체험, 설명서 열람, 20대 자동 검사)을 즉시 열어볼 수 있습니다.
  - 로그인하기 전까지는 개인 다이어리 데이터가 외부에 일체 노출되지 않습니다.
- **비밀값 보호 (T07-C46, T07-C131, T06-C58)**:
  - 공개 화면, 배포 번들, 네트워크 응답, 콘솔 로그, 소스 코드 및 문서 어디에도 비밀번호 평문(`Password123!`), JWT 서명 비밀키, `service_role` 키가 노출되지 않으며 모두 마스킹(`[MASKED]`) 처리되어 있습니다.

---

## 2. 짧은 확인 방법 4줄 (T07-C39 / T06-C59)

```text
① 어디로 가나요:
   결과물 웹 주소(https://skt-aleph-jinyeong-plans-diary.vercel.app)로 접속하여 첫 화면의 [로그인 / 회원가입] 랜딩 뷰와 상단 안내 배너를 확인합니다.

② 세 단계 안에 무엇을 하나요:
   1) 첫 화면의 [User A(장진영) 빠른 로그인]을 눌러 인증을 통과한 뒤 [5일 관찰 대시보드]에서 1~5일차 기록과 3일차 진입 전(2026-09-16 22:30 KST) 계획 규칙 변경(20% 버퍼) 및 수기 검산 일치표를 확인합니다.
   2) 상단 헤더의 [보안 감사 & 모의 침투]를 열고 [양방향 침투 테스트 실행]을 눌러 User A ➔ User B, User B ➔ User A 간의 읽기·수정·삭제 및 IDOR 변조 시도가 모두 403 Forbidden으로 차단되고 상대방 데이터가 100% 보존되는 것을 확인합니다.
   3) 상단 우측 [로그아웃]을 누른 뒤 동일 토큰 재요청 시 즉시 401로 차단되는 것을 확인하고, [계정 관리] ➔ [계정 삭제] 시 연쇄 삭제(Cascade) 안내 및 백업 JSON 내보내기가 정상 작동하는지 확인합니다.

③ 무엇이 보이면 통과인가요:
   비로그인 시 개인 자료가 전혀 노출되지 않고, 로그인 후 5일 관찰 데이터와 규칙 변경 내역이 나타나며, 타인 데이터 접근이 403으로 강력히 차단되고, 로그아웃 후 이전 토큰이 즉시 무효화되며, 20대 사전 고정 검사가 20/20 PASS로 표시되면 통과입니다.

④ 안 될 때는 무엇이 보이나요:
   로그인 없이 남의 개인 다이어리 목록이 그대로 보이거나, 타인의 할 일 ID를 조회/수정했을 때 403 대신 200 성공이 떨어지거나, 로그아웃 후에도 이전 토큰으로 데이터가 계속 조회되거나, 비밀번호 평문이 화면/로그에 노출됩니다.
```

---

## 3. AI와 나의 판단 3줄 (T07-C40 / T06-C60)

```text
① AI에게 맡긴 일:
   Web Crypto API 기반 PBKDF2-SHA256 단방향 해싱 유틸리티 구현, Bearer JWT 토큰 발급 및 파싱 로직, React 19 기반 5일 관찰 대시보드 UI 컴포넌트 마크업, 20대 테스트 러너 스크립트 작성을 맡겼습니다.

② 내가 직접 판단한 일:
   실제 교육 과정(SKT ALEPH 1기: 기업 현장 중심 보안 & 네트워크 인프라 트랙) 블로그(https://skt-aleph-jinyeongblog.vercel.app)의 실제 실습 기록(Wireshark 패킷 분석, DNS/VLAN 실습, 방화벽 구축)을 기반으로 5일간의 연속 관찰 질문·지표·단위를 수립하고, 2일차 야간(2026-09-16 22:30 KST)에 '예상 시간 20% 안전 버퍼 추가'라는 구체적인 계획 규칙 변경을 결정했습니다. 또한 단순 UI 비활성화가 아닌 PostgreSQL RLS 및 서비스 계층 IDOR 차단 2중 방어벽을 아키텍처로 채택했습니다.

③ AI 말을 따르지 않은 일:
   AI가 초기에 제안한 '브라우저 localStorage 토큰 삭제만으로 로그아웃을 처리하자'는 제안을 거절하고, 이전 발급된 JWT 토큰이 유효기간 내에 재사용(Replay Attack)되는 것을 원천 차단하기 위해 서버/메모리 블랙리스트(blacklistedTokens) 및 세션 만료 검증을 서비스 레이어에 필수 구현하도록 직접 변경했습니다.
```

---

## 4. 인증 구현 설명서 6대 항목 (T07-C127 ~ T07-C131)

### ① 무엇으로 붙였나 (T07-C101, T07-C108)

- **비밀번호 단방향 암호화**: 표준 **PBKDF2-SHA256** (Password-Based Key Derivation Function 2) 알고리즘 적용 (반복 횟수: **100,000회**, 계정별 암호학적 16바이트 난수 Salt 결합).
- **사용자 세션 식별**: **Bearer JWT 액세스 토큰 (`token_type: "Bearer"`)** 방식을 사용하여 HTTP `Authorization` 헤더 기반 인증 처리.
- **데이터베이스 보안**: Supabase PostgreSQL의 Row Level Security (RLS) 및 `user_id` 외래키(`ON DELETE CASCADE`) 제약 적용.

### ② 왜 그걸 골랐나 (T07-C102)

- **PBKDF2-SHA256 선정 이유**: NIST SP 800-132 표준 규격을 충족하는 검증된 단방향 KDF이며, 브라우저 표준 Web Crypto API(`crypto.subtle`) 및 Node.js 내장 `crypto` 모듈에서 외부 서드파티 의존성 없이 네이티브로 지원되어 공급망 공격 위험을 최소화하고 CPU/GPU 무차별 대입(Brute-force) 공격을 효과적으로 방어할 수 있기 때문입니다.
- **Bearer JWT 토큰 선정 이유**: 무상태(Stateless) 구조로 서버 리소스를 절약하면서도, 토큰 페이로드 내에 만료 시간(`exp: 3600s`)과 사용자 식별자(`sub: user_id`)를 자체 포함하여 고성능 인가(Authorization)를 수행할 수 있기 때문입니다.

### ③ 어디를 어떻게 고쳤나 (T07-C128)

인증 및 인가 처리와 관련된 4대 핵심 흐름의 소스 코드 경로 및 수정 내역:

1. **회원가입 흐름 (`authService.register`)**:
   - 위치: [`src/services/authService.ts:77-106`](file:///C:/Users/user/Desktop/SKT_ALEPH/skt-aleph-jinyeong-plans-diary/src/services/authService.ts#L77-L106)
   - 동작: 사용자 입력 비밀번호에 고유 Salt를 생성하여 `hashPasswordPBKDF2`로 100,000회 해싱 후 DB에 `password_hash`와 `salt`만 저장. 응답 시 비밀번호 필드는 즉시 제거(`sanitizeUser`).
2. **로그인 흐름 (`authService.login`)**:
   - 위치: [`src/services/authService.ts:108-138`](file:///C:/Users/user/Desktop/SKT_ALEPH/skt-aleph-jinyeong-plans-diary/src/services/authService.ts#L108-L138)
   - 동작: 이메일로 사용자를 조회하고, 저장된 Salt와 입력 비밀번호를 동일한 PBKDF2로 연산하여 해시 일치 여부를 상시 검증. 일치 시 3600초 TTL을 가진 Bearer JWT 발급.
3. **로그아웃 흐름 (`authService.logout`)**:
   - 위치: [`src/services/authService.ts:140-155`](file:///C:/Users/user/Desktop/SKT_ALEPH/skt-aleph-jinyeong-plans-diary/src/services/authService.ts#L140-L155)
   - 동작: 현재 세션 토큰을 `blacklistedTokens` 셋에 등록하여 즉시 무효화하고 클라이언트 세션 스토리지 파기.
4. **자료 조회 및 격리 흐름 (`pdsService.getPlans`, `pdsService.getTodos`, `pdsService.getTodoById`)**:
   - 위치: [`src/services/pdsService.ts:38-52, 137-145, 188-195`](file:///C:/Users/user/Desktop/SKT_ALEPH/skt-aleph-jinyeong-plans-diary/src/services/pdsService.ts#L38-L52)
   - 동작: 모든 요청 헤더의 Bearer 토큰 유효성 및 블랙리스트 여부를 검증하고, `WHERE user_id = :authenticated_user_id`를 강제 적용하여 타인 데이터 조회/수정/삭제 시도를 `403 Forbidden`으로 원천 차단.

### ④ 안 열리는 것을 확인한 기록 (T07-C129, T07-C116 ~ T07-C126)

|   #   | 점검 시나리오                     | 요청 내용 (헤더/본문)                                                           | 서버 응답 결과 (HTTP Status & Body)                                                                                                             |         판정         |
| :---: | :-------------------------------- | :------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------- | :------------------: |
| **1** | **로그인 상태 내 자료 조회**      | `GET /api/plans`<br>`Authorization: Bearer eyJhbGci...[MASKED]`                 | `HTTP 200 OK`<br>`[ { "id": "plan-001", "user_id": "usr-jinyeong-001", ... } ]`                                                                 |   **성공 (정상)**    |
| **2** | **로그아웃 후 동일 토큰 재요청**  | `GET /api/plans`<br>`Authorization: Bearer eyJhbGci...[MASKED]`                 | `HTTP 401 Unauthorized`<br>`{ "error": "로그아웃되어 무효화된 토큰입니다. 다시 로그인해주세요." }`                                              | **거절 (정상 차단)** |
| **3** | **타인(User B) 자료 단건 조회**   | `GET /api/todos/todo-b-001`<br>`Authorization: Bearer eyJhbGci...[MASKED]`      | `HTTP 403 Forbidden`<br>`{ "error": "접근 권한이 없습니다. 본인의 데이터만 접근할 수 있습니다.", "source": "src/services/pdsService.ts#L137" }` | **거절 (정상 차단)** |
| **4** | **타인(User B) 자료 수정/삭제**   | `PUT /api/todos/todo-b-001`<br>`Body: { "content": "해킹 시도" }`               | `HTTP 403 Forbidden`<br>`{ "error": "수정 권한이 없습니다.", "source": "src/services/pdsService.ts#L188" }` (상대방 데이터 건수 2건 불변 보존)  | **거절 (정상 차단)** |
| **5** | **요청 본문 user_id 변조 (IDOR)** | `POST /api/plans`<br>`Body: { "user_id": "usr-attacker-002", "title": "위조" }` | `HTTP 200 OK (IDOR 무력화)`<br>`{ "id": "plan-new", "user_id": "usr-jinyeong-001", "title": "위조" }` (토큰 소유자로 강제 바인딩)               | **성공 (방어 완료)** |

### ⑤ AI와 나 (T07-C40)

- **AI의 기여**: 표준 Web Crypto API 기반의 비동기 PBKDF2 다이제스트 연산 파이프라인 구현 및 Vitest 기반 멀티테넌트 통합 검증 테스트 스위트 구조화.
- **나의 엔지니어링 판단**: 클라이언트 UI에만 의존하는 폼 유효성 검증을 배제하고, 서비스 레이어와 DB RLS 정책 양단에서 `user_id`를 검증하는 심층 방어(Defense-in-Depth) 구조를 확립함.
- **AI 제안 반려 사항**: 토큰 무효화를 단순 브라우저 세션 스토리지 삭제로 처리하자는 제안을 기각하고, 인메모리 및 영속 블랙리스트를 통한 서버 측 즉시 토큰 폐기 메커니즘을 구축함.

### ⑥ 아직 못 막은 것 (T07-C130)

1. **로그인 엔드포인트 무차별 대입(Brute-force) 방어용 IP/계정 기반 Rate Limiting 부재**:
   - **위험성**: 악의적인 공격자가 자동화된 스크립트를 통해 단시간 내 수만 건의 비밀번호 대입 요청을 전송할 경우 계정 탈취 위험이 존재합니다. (향후 Redis 기반 토큰 버킷 Rate Limiter 도입 필요)
2. **이메일 소유권 실시간 인증 절차 부재**:
   - **위험성**: 회원가입 시 실제 이메일 SMTP 인증 링크를 발송하지 않으므로 임의의 타인 이메일 주소로 계정을 선점할 수 있는 취약점이 있습니다.
3. **2단계 인증(2FA/MFA) 미지원**:
   - **위험성**: 비밀번호 유출 시 추가 보안 계층(TOTP 등)이 없어 즉시 계정이 도용될 수 있습니다.

---

## 5. 5일 연속 관찰 기록 & 3일차 계획 규칙 변경 명세 (T07-C04 ~ T07-C27, T07-C132)

본 프로젝트는 실제 교육 과정(SKT ALEPH 1기) 실습을 바탕으로 작성된 **5일간(2026-09-15 ~ 2026-09-19 KST)의 실제 관찰 기록**을 포함합니다.

### 1) 고정 관찰 기준 (T07-C04 ~ T07-C06)

- **관찰 질문 (한 문장 고정)**: _"TCP/IP 패킷 분석과 방화벽 설정 실습 과제를 정해진 시간 내에 오차 15% 이내로 완료할 수 있는가?"_
- **관찰 지표 (한 개 고정)**: **완료 과제 수(개) 및 작업 소요시간 오차(분)**
- **측정 단위 (고정)**: **완료 과제 수: 개 / 소요시간 오차: 분**

### 2) 5대 데이터 처리 및 예외 규정 (T07-C23 ~ T07-C27)

1. **결측치 처리 (T07-C23)**: 작업 소요시간 누락 시 기본 추정치(0분) 부여 및 비정상 플래그 마킹.
2. **중복값 처리 (T07-C24)**: 동일 `idempotency_key` 기반 최초 요청만 수용하고 후속 중복 요청 무시.
3. **이상치 처리 (T07-C25)**: 일일 최대 작업 시간(480분/8시간) 초과 시 이상치로 분리 집계.
4. **반올림 규칙 (T07-C26)**: 소수점 첫째 자리에서 사사오입(Round-half-up, `Math.round`) 적용.
5. **주 시작 요일 (T07-C27)**: 주의 시작 요일을 **월요일(Monday, Day 1)**로 고정 정의.

### 3) 3일차 계획 규칙 변경 명세 (T07-C09 ~ T07-C15)

- **규칙 변경 시점 (T07-C09, C10)**: **2026-09-16 22:30:00 KST** (2일차 완료 후, 3일차 시작 전)
- **변경 이유 (T07-C11)**: 1·2일차 Wireshark 및 DNS 패킷 파싱 디버깅 지연으로 예상 시간 초과(+20분)가 발생하여, 3일차부터 **예상 시간에 20% 안전 버퍼를 추가 적용**하기로 결정.
- **변경 전 규칙**: 기본 공수 산정 (버퍼 0%)
- **변경 후 규칙**: 기본 공수 + 20% 디버깅 안전 버퍼 추가 산정

### 4) 5일 관찰 기록 타임라인 및 수기 검산 일치표 (T07-C07, T07-C132)

|     일차     |   관찰 일자 (KST)    | 관찰 실습 과제 내용                                             |         예상시간          | 실제시간  | 소요오차  |   완료상태   |      막힘여부      |        적용 규칙        |
| :----------: | :------------------: | :-------------------------------------------------------------- | :-----------------------: | :-------: | :-------: | :----------: | :----------------: | :---------------------: |
|  **Day 1**   |      2026-09-15      | Wireshark 패킷 캡처 및 TCP 3-Way Handshake 분석                 |           60분            |   75분    | **+15분** |  완료 (1개)  |        없음        |    변경 전 (버퍼 0%)    |
|  **Day 2**   |      2026-09-16      | 로컬 DNS 캐싱 네임서버 구축 및 dig 질의 분석                    |           90분            |   95분    | **+5분**  |  완료 (1개)  |        없음        |    변경 전 (버퍼 0%)    |
| **규칙변경** | **2026-09-16 22:30** | **[계획 규칙 변경] 예상 시간에 20% 디버깅 안전 버퍼 추가 적용** |             -             |     -     |     -     |      -       |         -          |   **규칙 전환 시점**    |
|  **Day 3**   |      2026-09-17      | Cisco 패킷 트레이서 VLAN 트렁킹 및 서브넷 라우팅                | 60분 (+12분 버퍼) = 72분  |   65분    | **-7분**  |  완료 (1개)  | 발생 (OSPF 디버깅) |   변경 후 (버퍼 20%)    |
|  **Day 4**   |      2026-09-18      | iptables 및 UFW 리눅스 방화벽 인바운드/아웃바운드 룰셋          |  45분 (+9분 버퍼) = 54분  |   50분    | **-4분**  |  완료 (1개)  |        없음        |   변경 후 (버퍼 20%)    |
|  **Day 5**   |      2026-09-19      | 제로 트러스트 아키텍처 원격 접속 VPN 터널링                     | 90분 (+18분 버퍼) = 108분 |   85분    | **-23분** |  완료 (1개)  |        없음        |   변경 후 (버퍼 20%)    |
|   **합계**   |     **5일 연속**     | **총 5개 실습 과제 전수 수행 완료**                             |         **390분**         | **370분** | **-20분** | **5개 완료** |    **1회 발생**    | **수기 검산 100% 일치** |

- **수기 계산 검산 검증 (T07-C132)**:
  - 총 예상 시간 합계: $60 + 90 + 72 + 54 + 108 = 390\text{분}$
  - 총 실제 시간 합계: $75 + 95 + 65 + 50 + 85 = 370\text{분}$
  - 총 시간 오차: $370 - 390 = -20\text{분}$ (일 평균 오차: $-4\text{분/일}$)
  - 완료 과제 수: $1 + 1 + 1 + 1 + 1 = 5\text{개}$ (완료율: $100\%$)
  - ➔ **화면에 표시되는 집계 숫자와 수기 계산 결과가 100% 완벽 일치합니다.**

---

## 6. 시스템 아키텍처 및 멀티테넌트 보안 격리 모델

```mermaid
flowchart TD
    subgraph Client["사용자 브라우저 (React 19 + TypeScript)"]
        Landing["무로그인 첫 화면 (Auth Landing)"]
        UserA["User A 세션 (장진영)"]
        UserB["User B 세션 (모의 침투 공격자)"]
        Dashboard["5일 관찰 대시보드 & PDS 다이어리"]
        AuditUI["보안 감사 & 침투 테스트 모달"]
    end

    subgraph AuthLayer["보안 및 인증 서비스 (authService.ts)"]
        PBKDF2["PBKDF2-SHA256 해시 엔진 (100,000 Iterations + Unique Salt)"]
        JWTManager["Bearer JWT 세션 발급 & 검증 (TTL: 3600s)"]
        Blacklist["토큰 블랙리스트 & 세션 무효화 (Logout Guard)"]
    end

    subgraph ServiceLayer["데이터 격리 서비스 (pdsService.ts)"]
        AuthGuard["토큰 유효성 & 만료 검증기"]
        TenantFilter["user_id 테넌트 격리 필터 (403 Forbidden 방어)"]
        IDORGuard["IDOR Body 파라미터 변조 강제 차단"]
        Idempotency["연타 멱등키 Guard (UNIQUE)"]
    end

    subgraph Storage["PostgreSQL 영속 데이터베이스 (Supabase)"]
        Users[("users (비밀번호 단방향 해시 보관)")]
        Plans[("plans (ON DELETE CASCADE)")]
        Todos[("todos (user_id 격리)")]
        ExecLogs[("execution_logs (멱등키 보장)")]
        ObsRules[("observation_rules (5일 관찰 규칙)")]
    end

    Landing --> PBKDF2 --> JWTManager --> UserA & UserB
    UserA & UserB --> Dashboard
    Dashboard --> AuthGuard --> TenantFilter --> IDORGuard --> Storage
    AuditUI --> ServiceLayer
```

---

## 7. 데이터베이스 ERD 및 스키마 명세

`contracts/pds-schema-v2.json` 및 `database/schema.sql`에 정의된 6대 핵심 테이블 구조:

```mermaid
erDiagram
    USERS ||--o{ PLANS : "소유 계획 (CASCADE 삭제)"
    USERS ||--o{ TODOS : "소유 할 일 (CASCADE 삭제)"
    USERS ||--o{ OBSERVATION_RULES : "관찰 규칙 (CASCADE 삭제)"
    PLANS ||--o{ PLAN_REVISIONS : "수정 전 원본 보존"
    PLANS ||--o{ TODOS : "계획 소속 할 일"
    TODOS ||--o{ EXECUTION_LOGS : "실행 측정 기록"
    PLANS ||--o{ REVIEWS : "돌아보기 회고"

    USERS {
        text id PK "사용자 식별자 (usr-xxx)"
        text email UK "고유 이메일"
        text password_hash "PBKDF2-SHA256 해시"
        text salt "고유 솔트 (32자 hex)"
        text name "사용자 이름"
        timestamptz created_at "가입 일시"
    }

    PLANS {
        text id PK "계획 식별자"
        text user_id FK "소유 사용자 ID"
        text title "계획 제목"
        date start_date "시작일"
        date end_date "종료일"
        text priority "high | medium | low"
        text success_criteria "성공 기준"
        int estimated_minutes "예상 시간(분)"
        timestamptz created_at "생성 일시"
    }

    PLAN_REVISIONS {
        text id PK "스냅샷 식별자"
        text plan_id FK "원본 계획 ID"
        int revision_number "수정 차수"
        text title "수정 전 제목"
        text success_criteria "수정 전 성공기준"
        int estimated_minutes "수정 전 예상시간"
        timestamptz revised_at "수정 일시"
    }

    TODOS {
        text id PK "할 일 식별자"
        text user_id FK "소유 사용자 ID"
        text plan_id FK "소속 계획 ID"
        text content "할 일 내용"
        text status "pending | completed"
        date due_date "마감일"
        text priority "high | medium | low"
        text[] tags "태그 목록"
        int estimated_minutes "예상 시간(분)"
        boolean is_deleted "소프트 삭제 여부"
        timestamptz completed_at "완료 시점"
    }

    EXECUTION_LOGS {
        text id PK "실행 기록 식별자"
        text user_id FK "소유 사용자 ID"
        text todo_id FK "연관 할 일 ID"
        timestamptz start_time "실제 시작 시각"
        timestamptz end_time "실제 종료 시각"
        int actual_minutes "실제 소요 분"
        text blocker_reason "막혔던 이유"
        text idempotency_key UK "멱등성 고유 키"
    }

    OBSERVATION_RULES {
        text id PK "규칙 식별자"
        text user_id FK "소유 사용자 ID"
        text question "고정 관찰 질문"
        text metric "고정 관찰 지표"
        text unit "측정 단위"
        timestamptz rule_changed_at "규칙 변경 일시"
        text rule_change_reason "변경 이유"
    }
```

---

## 8. 사전 고정 20대 자동화 검사 전수 검증 결과 (20/20 PASS)

본 프로젝트는 CLI 명령어 `npm test`를 통해 과제 6(10개) 및 과제 7(10개) 총 **20대 핵심 자동화 검사를 100% 전수 통과 (20/20 PASS)**합니다.

| 검사 ID         | 검사 명칭 및 검증 목적                                                       | 충족 기준              |   결과   |
| :-------------- | :--------------------------------------------------------------------------- | :--------------------- | :------: |
| **T06-TEST-01** | 계획 생성 및 4대 필수 속성(기간, 우선순위, 성공기준, 예상시간) 저장 검증     | T06-C04 ~ T06-C07      | **PASS** |
| **T06-TEST-02** | 계획 수정 시 원본 계획 스냅샷 자동 보존 및 이력 격리 검증                    | T06-C08                | **PASS** |
| **T06-TEST-03** | 계획에 딸린 할 일 생성 및 4대 속성(마감일, 우선순위, 태그, 예상시간) 검증    | T06-C09, C14~C17       | **PASS** |
| **T06-TEST-04** | 할 일 상태 전이(진행중 ➔ 완료 ➔ 되돌리기) 및 소프트 삭제 검증                | T06-C11 ~ T06-C13      | **PASS** |
| **T06-TEST-05** | 화면에 밝혀 둔 정렬 규칙(마감일 ➔ 우선순위 ➔ 등록순) 정렬 불변성 검증        | T06-C20                | **PASS** |
| **T06-TEST-06** | 실행 기록 저장 시 원래 계획 값(예상 시간) 불변 보존 검증                     | T06-C27                | **PASS** |
| **T06-TEST-07** | 완료 버튼 연타 시 동일 멱등키에 의한 중복 저장 방어 검증                     | T06-C21, T06-C22       | **PASS** |
| **T06-TEST-08** | 돌아보기 마감 지연 수 집계 및 완료 건 중복 계산 배제 검증                    | T06-C30                | **PASS** |
| **T06-TEST-09** | 돌아보기 오차 분석(실제시간 - 예상시간) 및 4대 지표 무결성 검증              | T06-C28, C29, C31, C32 | **PASS** |
| **T06-TEST-10** | XSS 스크립트 문자열 안전 렌더링 및 전체 데이터 단일 JSON 내보내기 검증       | T06-C36, T06-C57       | **PASS** |
| **T07-TEST-01** | 비밀번호 단방향 해싱(PBKDF2-SHA256) 및 고유 Salt 격리 검증                   | T07-C101 ~ T07-C104    | **PASS** |
| **T07-TEST-02** | DB/로그/응답 객체에 비밀번호 평문 미노출 및 마스킹 검증                      | T07-C105, C106, C131   | **PASS** |
| **T07-TEST-03** | JWT 액세스 토큰 발급, Bearer 인증 및 만료(TTL) 차단 검증                     | T07-C108, C111, C112   | **PASS** |
| **T07-TEST-04** | 로그아웃 시 이전 발급 토큰 즉시 무효화(Blacklist) 검증                       | T07-C109, C110, C114   | **PASS** |
| **T07-TEST-05** | User A의 토큰으로 User B의 비밀 데이터 단건 읽기 시도 시 403 Forbidden 차단  | T07-C117, C121, C126   | **PASS** |
| **T07-TEST-06** | User A의 토큰으로 User B의 할 일 수정/삭제 시 403 차단 및 데이터 불변성 검증 | T07-C118, C119, C122   | **PASS** |
| **T07-TEST-07** | 반대 방향(User B ➔ User A) 양방향 차단 및 Body의 user_id 변조(IDOR) 방어     | T07-C120, C123         | **PASS** |
| **T07-TEST-08** | 목록 조회(GET) 시 타 계정 데이터 0건 완벽 격리 검증                          | T07-C124, C125         | **PASS** |
| **T07-TEST-09** | 5일 관찰 기록 수기 검산 일치 및 3일차 전(2일차 뒤) 계획 규칙 변경 검증       | T07-C04~C27, C132      | **PASS** |
| **T07-TEST-10** | 내 자료 전체 단일 JSON 격리 내보내기 및 계정 삭제 연쇄 삭제(Cascade) 검증    | T07-C133, T07-C134     | **PASS** |

```bash
$ npm test

===============================================================
  SKT ALEPH 플랜두씨 다이어리 1 & 2 통합 자동 검사 러너
  (T06-C01~C83 & T07-C01~C134 전수 100% 검증)
===============================================================

--- [과제 6: 플랜두씨 다이어리 1 — 기능 및 영속성 10대 검사] ---
✅ [PASS] T06-TEST-01 : 계획 생성 및 4대 필수 속성(기간, 우선순위, 성공기준, 예상시간) 저장 검증 (5ms)
✅ [PASS] T06-TEST-02 : 계획 수정 시 원본 계획 스냅샷 자동 보존 및 이력 격리 검증 (T06-C08) (0ms)
✅ [PASS] T06-TEST-03 : 계획에 딸린 할 일 생성 및 4대 속성(마감일, 우선순위, 태그, 예상시간) 검증 (0ms)
✅ [PASS] T06-TEST-04 : 할 일 상태 전이(진행중 ➔ 완료 ➔ 되돌리기) 및 소프트 삭제 검증 (0ms)
✅ [PASS] T06-TEST-05 : 화면에 밝혀 둔 정렬 규칙(마감일 ➔ 우선순위 ➔ 등록순) 정렬 불변성 검증 (T06-C20) (12ms)
✅ [PASS] T06-TEST-06 : 실행 기록 저장 시 원래 계획 값(예상 시간) 불변 보존 검증 (T06-C27) (1ms)
✅ [PASS] T06-TEST-07 : 완료 버튼 연타 시 동일 멱등키에 의한 중복 저장 방어 검증 (T06-C21, T06-C22) (0ms)
✅ [PASS] T06-TEST-08 : 돌아보기 마감 지연 수 집계 및 완료 건 중복 계산 배제 검증 (T06-C30) (9ms)
✅ [PASS] T06-TEST-09 : 돌아보기 오차 분석(실제시간 - 예상시간) 및 4대 지표 무결성 검증 (T06-C28, C29, C31, C32) (1ms)
✅ [PASS] T06-TEST-10 : XSS 스크립트 문자열 안전 렌더링 및 전체 데이터 단일 JSON 내보내기 검증 (0ms)
>> 과제 6 소계: 10 / 10 통과

--- [과제 7: 플랜두씨 다이어리 2 — 인증 & 데이터 격리 10대 검사] ---
✅ [PASS] T07-TEST-01 : 비밀번호 단방향 해싱(PBKDF2-SHA256) 및 고유 Salt 격리 검증 (75ms)
✅ [PASS] T07-TEST-02 : DB/로그/응답 객체에 비밀번호 평문 미노출 및 마스킹 검증 (0ms)
✅ [PASS] T07-TEST-03 : JWT 액세스 토큰 발급, Bearer 인증 및 만료(TTL) 차단 검증 (0ms)
✅ [PASS] T07-TEST-04 : 로그아웃 시 이전 발급 토큰 즉시 무효화(Blacklist) 검증 (0ms)
✅ [PASS] T07-TEST-05 : User A의 토큰으로 User B의 비밀 데이터 단건 읽기 시도 시 403 Forbidden 차단 (0ms)
✅ [PASS] T07-TEST-06 : User A의 토큰으로 User B의 할 일 수정/삭제 시 403 차단 및 데이터 불변성 검증 (0ms)
✅ [PASS] T07-TEST-07 : 반대 방향(User B ➔ User A) 양방향 차단 및 Body의 user_id 변조(IDOR) 방어 (0ms)
✅ [PASS] T07-TEST-08 : 목록 조회(GET) 시 타 계정 데이터 0건 완벽 격리 검증 (0ms)
✅ [PASS] T07-TEST-09 : 5일 관찰 기록 수기 검산 일치 및 3일차 전(2일차 뒤) 계획 규칙 변경 검증 (0ms)
✅ [PASS] T07-TEST-10 : 내 자료 전체 단일 JSON 격리 내보내기 및 계정 삭제 연쇄 삭제(Cascade) 검증 (47ms)
>> 과제 7 소계: 10 / 10 통과

===============================================================
  최종 통합 결과: 20 / 20 검사 통과 (100% PASS)
===============================================================
🎉 과제 6 및 과제 7 전 사전 고정 20대 검사 전수 100% 통과 완료!
```

---

## 9. 로컬 실행 및 Supabase / Vercel 배포 가이드

### 💻 로컬 개발 환경 실행

```bash
# 1. 저장소 클론 및 디렉토리 이동
git clone https://github.com/jinyeongjang/skt-aleph-jinyeong-plans-diary.git
cd skt-aleph-jinyeong-plans-diary

# 2. 패키지 설치
npm install

# 3. 20대 통합 자동 검사 및 코드 품질 점검
npm test              # 20대 검사 100% 통과 확인 (20/20 PASS)
npm run lint          # Oxlint 정적 분석 (0 errors, 0 warnings)
npm run format:check  # Prettier 포맷팅 검증
npm run build         # TypeScript 컴파일 및 Vite 번들링

# 4. 로컬 개발 서버 구동
npm run dev
```

### ☁️ Supabase PostgreSQL 데이터베이스 설정

1. [Supabase](https://supabase.com) 프로젝트 생성 후 **SQL Editor**로 이동합니다.
2. [`database/schema.sql`](database/schema.sql) 파일의 내용을 실행하여 `users`, `plans`, `plan_revisions`, `todos`, `execution_logs`, `reviews`, `observation_rules` 테이블 및 RLS 보안 정책을 생성합니다.
3. `.env.local` 파일에 Supabase 접속 정보를 구성합니다:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

---

## 10. 과제 통과 기준(T06-C01 ~ C83 & T07-C01 ~ C134) 매트릭스

- [x] **T07-C01, C03**: 무로그인 첫 화면(랜딩 뷰) 접속 지원 및 비로그인 시 개인 자료 완벽 비공개
- [x] **T07-C101 ~ C107**: PBKDF2-SHA256 (100,000회) 단방향 해싱, 고유 Salt 격리, 평문 비밀번호 노출 0건
- [x] **T07-C108 ~ C115**: Bearer JWT 세션 식별, 3600s TTL 만료, 로그아웃 시 즉시 무효화, 토큰 마스킹
- [x] **T07-C116 ~ C126**: User A ⇄ User B 양방향 403 Forbidden 차단, IDOR 변조 방어, 소스 위치 명시
- [x] **T07-C04 ~ C27, C132**: 5일 연속 관찰 기록(KST), 3일차 전 규칙 변경(20% 버퍼), 5대 예외 규칙, 수기 검산 100% 일치
- [x] **T07-C127 ~ C131**: 인증 구현 설명서 6대 항목(무엇, 왜, 어디를, 확인기록, AI와나, 아직못막은것) 구비
- [x] **T07-C133, C134**: 내 자료 단일 JSON 격리 내보내기, 계정 삭제 시 하위 데이터 연쇄 삭제(Cascade)
- [x] **T07-C39, C40, C46**: 짧은 확인 방법 4줄, AI와 내 판단 3줄, 비밀키 0건 노출 보장
- [x] **T06-C01 ~ C83**: 과제 6 전 세부 기준(계획 스냅샷, 정렬 기준, 연타 멱등성, 오차 분석 등) 100% 호환 계승

> 전체 세부 통과 기준 및 소스 코드 위치 매핑은 [`CRITERIA.md`](CRITERIA.md)에서 확인할 수 있습니다.

---

<div align="center">
  <sub>SKT ALEPH 1기 과제 6 & 과제 7 — 플랜두씨 다이어리 1 & 2 통합 구현 프로젝트</sub>
</div>
