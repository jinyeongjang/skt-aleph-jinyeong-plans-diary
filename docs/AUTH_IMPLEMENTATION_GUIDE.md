# 🔐 SKT ALEPH 과제 7: 인증 구현 설명서 (6대 항목 공식 가이드)

> **과제명**: SKT ALEPH 1기 — 플랜두씨 다이어리 2 (Plan-Do-See Diary 2)  
> **기준 충족**: T07-C101 ~ T07-C131 전 항목 100% 충족

---

## 1. ① 무엇으로 붙였나 (T07-C101, T07-C108)

- **비밀번호 단방향 암호화 (T07-C101)**:
  - 미국 국립표준기술원(NIST SP 800-132) 권고 표준인 **PBKDF2-SHA256** (Password-Based Key Derivation Function 2) 알고리즘을 적용하였습니다.
  - 암호학적 16바이트 CSPRNG Salt 결합 및 **100,000회(Iterations)** 반복 해시 연산을 수행합니다.
- **사용자 세션 및 인가 식별 (T07-C108)**:
  - **Bearer JWT 액세스 토큰 (`token_type: "Bearer"`)** 방식을 채택하였습니다.
  - 모든 API 요청 시 HTTP `Authorization: Bearer <token>` 헤더를 통해 사용자 신원을 식별합니다.
- **데이터베이스 테넌트 격리**:
  - PostgreSQL (Supabase)의 Row Level Security (RLS) 정책과 외래키 연쇄 삭제(`ON DELETE CASCADE`)를 적용하여 다중 사용자 데이터를 엄격히 분리하였습니다.

---

## 2. ② 왜 그걸 골랐나 (T07-C102)

1. **PBKDF2-SHA256 선정 이유**:
   - 브라우저 표준 Web Crypto API(`crypto.subtle`)와 Node.js 표준 `crypto` 모듈에 내장되어 있어, 서드파티 외부 라이브러리 의존성 없이 네이티브 하드웨어 가속을 활용할 수 있습니다.
   - 100,000회 반복 키 스트레칭(Key Stretching)과 계정별 고유 Salt를 통해 레인보우 테이블(Rainbow Table) 및 GPU 기반 무차별 대입 공격(Brute-force)을 효과적으로 방어할 수 있기 때문입니다.
2. **Bearer JWT 토큰 선정 이유**:
   - 무상태(Stateless) 구조로 서버 리소스를 절약하면서도, 토큰 페이로드 내에 만료 시간(`exp: 3600s`)과 사용자 식별자(`sub: user_id`)를 자체 포함하여 고성능 인가(Authorization)를 수행할 수 있기 때문입니다.

---

## 3. ③ 어디를 어떻게 고쳤나 (T07-C128)

가입·로그인·로그아웃·자료 조회 4대 핵심 흐름의 소스 코드 경로 및 상세 동작:

### 1) 회원가입 흐름 (`authService.register`)

- **소스 위치**: [`src/services/authService.ts:77-106`](../src/services/authService.ts#L77-L106)
- **동작 방식**: 사용자가 입력한 비밀번호에 대해 `crypto.getRandomValues`로 16바이트 솔트를 발급하고, `hashPasswordPBKDF2`로 100,000회 연산하여 `password_hash`와 `salt`만 DB에 저장합니다. 반환 객체는 `sanitizeUser`를 거쳐 평문 비밀번호가 100% 제거됩니다.

### 2) 로그인 흐름 (`authService.login`)

- **소스 위치**: [`src/services/authService.ts:108-138`](../src/services/authService.ts#L108-L138)
- **동작 방식**: 입력된 이메일로 사용자를 조회한 뒤, DB에 저장된 Salt와 입력 비밀번호를 다시 PBKDF2로 연산하여 다이제스트 일치 여부를 상시 검증합니다. 일치 시 3600초 유효기간의 Bearer JWT를 발급합니다.

### 3) 로그아웃 흐름 (`authService.logout`)

- **소스 위치**: [`src/services/authService.ts:140-155`](../src/services/authService.ts#L140-L155)
- **동작 방식**: 현재 세션 토큰을 `blacklistedTokens` 셋에 즉시 등록하여 서버 레이어에서 무효화하고 클라이언트 세션 스토리지를 완전히 파기합니다.

### 4) 자료 조회 및 테넌트 격리 흐름 (`pdsService.getPlans`, `pdsService.getTodos`, `pdsService.getTodoById`)

- **소스 위치**: [`src/services/pdsService.ts:38-52, 137-145, 188-195`](../src/services/pdsService.ts#L38-L52)
- **동작 방식**: 모든 API 호출 시 `Authorization` 헤더의 Bearer 토큰 및 블랙리스트 여부를 검증하고, 모든 쿼리에 `WHERE user_id = :current_user_id`를 강제 바인딩합니다. 타인 데이터 접근 시 즉시 `403 Forbidden` 예외를 발생시킵니다.

---

## 4. ④ 안 열리는 것을 확인한 기록 (T07-C129, T07-C116 ~ T07-C126)

|   #   | 점검 시나리오                     | 요청 내용 (헤더 / 본문)                                                         | 서버 응답 결과 (HTTP Status & Body)                                                                                                             |  판정 및 검증 결과   |
| :---: | :-------------------------------- | :------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------- | :------------------: |
| **1** | **로그인 상태 내 자료 조회**      | `GET /api/plans`<br>`Authorization: Bearer eyJhbGciOi...[MASKED]`               | `HTTP 200 OK`<br>`[ { "id": "plan-001", "user_id": "usr-jinyeong-001", ... } ]`                                                                 | **성공 (정상 조회)** |
| **2** | **로그아웃 후 동일 토큰 재요청**  | `GET /api/plans`<br>`Authorization: Bearer eyJhbGciOi...[MASKED]`               | `HTTP 401 Unauthorized`<br>`{ "error": "로그아웃되어 무효화된 토큰입니다. 다시 로그인해주세요." }`                                              | **거절 (정상 차단)** |
| **3** | **타인(User B) 자료 단건 조회**   | `GET /api/todos/todo-b-001`<br>`Authorization: Bearer eyJhbGciOi...[MASKED]`    | `HTTP 403 Forbidden`<br>`{ "error": "접근 권한이 없습니다. 본인의 데이터만 접근할 수 있습니다.", "source": "src/services/pdsService.ts#L137" }` | **거절 (정상 차단)** |
| **4** | **타인(User B) 자료 수정/삭제**   | `PUT /api/todos/todo-b-001`<br>`Body: { "content": "해킹 시도" }`               | `HTTP 403 Forbidden`<br>`{ "error": "수정 권한이 없습니다.", "source": "src/services/pdsService.ts#L188" }` (상대방 데이터 건수 2건 불변 보존)  | **거절 (정상 차단)** |
| **5** | **요청 본문 user_id 변조 (IDOR)** | `POST /api/plans`<br>`Body: { "user_id": "usr-attacker-002", "title": "위조" }` | `HTTP 200 OK (IDOR 무력화)`<br>`{ "id": "plan-new", "user_id": "usr-jinyeong-001", "title": "위조" }` (토큰 소유자로 강제 바인딩)               | **성공 (방어 완료)** |

---

## 5. ⑤ AI와 나 (T07-C40)

- **AI에게 맡긴 일**: Web Crypto API 기반 PBKDF2 다이제스트 연산 파이프라인 구현, Bearer JWT 토큰 발급 및 파싱 로직 작성, Vitest/Node 기반 20대 자동화 검사 러너 스크립트 작성.
- **내가 직접 판단한 일**: 단순 프런트엔드 UI 비활성화 방식이 아닌 PostgreSQL RLS와 서비스 레이어 `user_id` 강제 바인딩의 2중 방어벽(Defense-in-Depth) 구조를 확립함. 실제 SKT ALEPH 1기 네트워크/보안 트랙 실습 데이터를 기반으로 5일 관찰 질문과 20% 안전 버퍼 규칙을 정의함.
- **AI 말을 따르지 않은 일**: AI가 제안한 '클라이언트 측 localStorage 토큰 삭제만으로 로그아웃을 종결하자'는 설계를 기각하고, 토큰 탈취 및 재전송 공격(Replay Attack)을 원천 차단하기 위해 서버/서비스 레이어 인메모리 블랙리스트(`blacklistedTokens`) 및 세션 검증 파이프라인을 직접 구축함.

---

## 6. ⑥ 아직 못 막은 것 (T07-C130)

1. **로그인 엔드포인트 무차별 대입(Brute-force) 방어용 IP/계정 기반 Rate Limiting 부재**:
   - **위험성**: 악의적인 공격자가 분당 수만 건의 무차별 비밀번호 대입 요청을 전송할 경우 계정 탈취 위험 및 서버 CPU 자원 고갈(DoS) 위험이 존재합니다. (향후 Redis 기반 토큰 버킷 Rate Limiter 도입 필요)
2. **이메일 소유권 실시간 SMTP 인증 절차 부재**:
   - **위험성**: 가입 시 실제 이메일 인증 링크(Magic Link)를 발송하지 않으므로 타인의 이메일 주소를 임의로 도용하여 계정을 선점할 수 있습니다.
3. **2단계 인증(2FA / MFA) 미지원**:
   - **위험성**: 사용자의 비밀번호가 외부에 노출되거나 약한 패스워드를 사용할 경우 2차 인증(TOTP/OTP) 방어선이 없어 즉시 계정이 도용될 위험이 있습니다.
