import type { FixedTestCase } from '../types/pds.ts';

/**
 * 과제 7 사전 고정 10대 검사 명세 (T07-TEST-01 ~ T07-TEST-10)
 *
 * - 카드 1: 진입 및 비밀번호 보안 (T07-C03, T07-C101 ~ T07-C107)
 * - 카드 2: 토큰 세션 수명 및 만료 (T07-C108 ~ T07-C115)
 * - 카드 3: 양방향 침범 차단 및 IDOR 방어 (T07-C116 ~ T07-C126)
 * - 카드 4: 5일 관찰 질문·지표·계획 규칙 변경 (T07-C04 ~ T07-C27, T07-C132)
 * - 카드 5: 내보내기 및 계정 연쇄 삭제 (T07-C133, T07-C134)
 */
export const FIXED_TEST_SPECS_T07: FixedTestCase[] = [
  {
    id: 'T07-TEST-01',
    name: '비밀번호 단방향 해싱(PBKDF2-SHA256) 및 고유 Salt 격리 검증',
    category: 'security',
    inputDescription: '동일한 비밀번호 "SktAleph!2026#Secure*Pass99"로 생성된 User A와 User B의 계정 해시 대조',
    expectedDescription:
      'T07-C101(알고리즘 명시), T07-C103(평문 미저장), T07-C104(서로 다른 salt로 인해 저장된 해시값이 완전히 다름) 충족',
    boundaryNote: '고유 16바이트 솔트 분리 및 100,000회 키 파생 반복 연산',
    passedInA: true,
    passedInB: true,
  },
  {
    id: 'T07-TEST-02',
    name: 'DB/로그/응답 객체에 비밀번호 평문 미노출 및 마스킹 검증',
    category: 'security',
    inputDescription: '로그인 및 사용자 생성 후 반환된 세션, DB 레코드, 응답 객체 검사',
    expectedDescription: 'T07-C105, T07-C106, T07-C131에 따라 어떤 객체에도 평문 비밀번호 원문이 남지 않고 마스킹됨',
    boundaryNote: '화면 및 네트워크 페이로드에 비밀키/평문 노출 0건',
    passedInA: true,
    passedInB: true,
  },
  {
    id: 'T07-TEST-03',
    name: 'JWT 액세스 토큰 발급, Bearer 인증 및 만료(TTL) 차단 검증',
    category: 'ingestion',
    inputDescription: '유효 토큰 요청 및 유효기간(TTL 3600초)이 경과한 토큰으로 API 요청',
    expectedDescription:
      'T07-C108(토큰 식별), T07-C111(만료시각 존재 및 만료 후 401 Unauthorized 거절), T07-C112(URL 비노출) 충족',
    boundaryNote: 'Authorization: Bearer 헤더를 통해서만 전달',
    passedInA: true,
    passedInB: true,
  },
  {
    id: 'T07-TEST-04',
    name: '로그아웃 시 이전 발급 토큰 즉시 무효화(Blacklist) 검증',
    category: 'resilience',
    inputDescription: '로그인 후 발급받은 토큰으로 정상 요청(200) 후, logoutUser() 호출 뒤 동일 토큰으로 재요청',
    expectedDescription: 'T07-C109, T07-C110, T07-C114에 따라 로그아웃 후 동일한 요청이 401 Unauthorized로 거절됨',
    boundaryNote: '달라진 것은 오직 로그아웃 여부뿐임이 기록에서 증명됨',
    passedInA: true,
    passedInB: true,
  },
  {
    id: 'T07-TEST-05',
    name: 'User A의 토큰으로 User B의 비밀 데이터 단건 읽기 시도 시 403 Forbidden 차단',
    category: 'security',
    inputDescription: 'User A가 User B 소유의 비밀 계획(plan-attacker-secret-999) 단건 조회(GET) 요청',
    expectedDescription: 'T07-C117, T07-C121, T07-C126에 따라 403 Forbidden 거절이 발생하고 소스 위치가 명시됨',
    boundaryNote: '존재 감춤을 위한 404 또는 명시적 403 반환',
    passedInA: true,
    passedInB: true,
  },
  {
    id: 'T07-TEST-06',
    name: 'User A의 토큰으로 User B의 할 일 수정/삭제 시 403 차단 및 데이터 불변성 검증',
    category: 'storage',
    inputDescription: 'User A가 User B의 할 일을 수정(PATCH) 및 삭제(DELETE) 시도',
    expectedDescription:
      'T07-C118, T07-C119, T07-C122에 따라 403 거절되고 상대방 데이터의 내용과 건수가 100% 불변 보존',
    boundaryNote: '공격 시도 전후 User B 데이터 건수 및 속성 대조',
    passedInA: true,
    passedInB: true,
  },
  {
    id: 'T07-TEST-07',
    name: '반대 방향(User B ➔ User A) 양방향 차단 및 Body의 user_id 변조(IDOR) 방어',
    category: 'security',
    inputDescription: 'User B가 User A의 주 계획 수정 시도 및 요청 Body에 user_id="usr-victim" 주입 시도',
    expectedDescription: 'T07-C120(양방향 동일 거절), T07-C123(Body 변조 무시하고 인증 주체에만 강제 바인딩) 충족',
    boundaryNote: '파라미터 변조(IDOR) 원천 무력화',
    passedInA: true,
    passedInB: true,
  },
  {
    id: 'T07-TEST-08',
    name: '목록 조회(GET) 시 타인 데이터 0건 완벽 격리 검증',
    category: 'boundary',
    inputDescription: 'User A의 getPlans() 및 getTodos() 호출 결과 전체 레코드의 user_id 검사',
    expectedDescription: 'T07-C125에 따라 User A의 조회 결과에 User B 소유의 레코드가 0건(완벽 제외)으로 필터링됨',
    boundaryNote: 'WHERE user_id = auth.uid() 정책 보장',
    passedInA: true,
    passedInB: true,
  },
  {
    id: 'T07-TEST-09',
    name: '5일 관찰 기록 수기 검산 일치 및 3일차 전(2일차 뒤) 계획 규칙 변경 검증',
    category: 'analysis',
    inputDescription: '5일 연속(2026-09-15~19) 실행 데이터 합계/평균 산출 및 3일차 앞 규칙 변경 시각 대조',
    expectedDescription:
      'T07-C04~C15(관찰질문/지표/단위/규칙변경시각/사유) 및 T07-C132(화면 통계와 수기 검산 440분/465분/+25분 100% 일치) 충족',
    boundaryNote: '2일차 뒤 3일차 앞 (2026-09-16 22:30 KST) 변경',
    passedInA: true,
    passedInB: true,
  },
  {
    id: 'T07-TEST-10',
    name: '내 자료 전체 단일 JSON 격리 내보내기 및 계정 삭제 연쇄 삭제(Cascade) 검증',
    category: 'storage',
    inputDescription: 'User A 소유 데이터만 JSON 내보내기 검증 후, 테스트 계정 삭제 시 하위 데이터 연쇄 삭제 검증',
    expectedDescription:
      'T07-C133(단일 JSON 내보내기), T07-C134(계정 삭제 시 소속 plans/todos/logs/reviews 연쇄 삭제) 충족',
    boundaryNote: 'ON DELETE CASCADE 무결성 검증',
    passedInA: true,
    passedInB: true,
  },
];
