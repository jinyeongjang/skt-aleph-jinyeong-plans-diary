import type { FixedTestCase } from '../types/pds.ts';

/**
 * 과제 6 사전 고정 10대 검사 명세 (T06-TEST-01 ~ T06-TEST-10)
 *
 * - 카드 1: 계획 세우기 (T06-C04 ~ T06-C08)
 * - 카드 2: 할 일 다루기 (T06-C09 ~ T06-C20)
 * - 카드 3: 실제로 한 일 적기 (T06-C21 ~ T06-C27)
 * - 카드 4: 돌아보기 및 다음 계획 (T06-C28 ~ T06-C33, T06-C83)
 * - 카드 5: 내 것으로 채우고 잃지 않게 (T06-C34 ~ T06-C36, T06-C57, T06-C58, T06-C78 ~ T06-C82)
 */
export const FIXED_TEST_SPECS: FixedTestCase[] = [
  {
    id: 'T06-TEST-01',
    name: '계획 생성 및 4대 필수 속성(기간, 우선순위, 성공기준, 예상시간) 저장 검증',
    category: 'metadata',
    inputDescription:
      '신규 계획 페이로드 (시작일: 2026-09-15, 마감일: 2026-09-22, 우선순위: high, 성공기준, 예상시간: 360분)',
    expectedDescription:
      'T06-C04(기간), T06-C05(우선순위), T06-C06(성공기준), T06-C07(예상시간)이 데이터베이스에 100% 정상 저장 및 복원',
    boundaryNote: '시작일 <= 종료일, 우선순위 3단계(high/medium/low), 예상시간 양수 정수',
    passedInA: true,
    passedInB: true,
  },
  {
    id: 'T06-TEST-02',
    name: '계획 수정 시 원본 계획 스냅샷 자동 보존 및 이력 격리 검증 (T06-C08)',
    category: 'storage',
    inputDescription: '기존 계획 ID에 대해 제목 및 예상 시간을 수정한 업데이트 요청 전송',
    expectedDescription:
      '계획 ID는 유지되며, 수정 전 스냅샷이 plan_revisions에 revision_number=1로 온전히 보존됨 (T06-C08 충족)',
    boundaryNote: '수정 전 값과 수정 후 값이 물리적으로 분리되어 존재',
    passedInA: true,
    passedInB: true,
  },
  {
    id: 'T06-TEST-03',
    name: '계획에 딸린 할 일 생성 및 4대 속성(마감일, 우선순위, 태그, 예상시간) 검증',
    category: 'ingestion',
    inputDescription: '계획 ID에 연결된 신규 할 일 (마감일, 우선순위, 태그 3개, 예상 60분)',
    expectedDescription:
      'T06-C09(생성), T06-C14(마감일), T06-C15(우선순위), T06-C16(태그), T06-C17(예상시간) 저장 일치',
    boundaryNote: '태그 배열 다중 항목 및 마감일 날짜 포맷 YYYY-MM-DD',
    passedInA: true,
    passedInB: true,
  },
  {
    id: 'T06-TEST-04',
    name: '할 일 상태 전이(진행중 ➔ 완료 ➔ 되돌리기) 및 소프트 삭제 검증',
    category: 'resilience',
    inputDescription: '할 일에 대해 completeTodo ➔ revertTodo ➔ deleteTodo 연속 호출',
    expectedDescription:
      'T06-C11(완료), T06-C12(진행중 되돌리기), T06-C13(삭제 시 is_deleted=true 및 활성 목록 제외) 충족',
    boundaryNote: 'completed_at 타임스탬프 설정 및 되돌리기 시 null 초기화',
    passedInA: true,
    passedInB: true,
  },
  {
    id: 'T06-TEST-05',
    name: '화면에 밝혀 둔 정렬 규칙(마감일 ➔ 우선순위 ➔ 등록순) 정렬 불변성 검증 (T06-C20)',
    category: 'analysis',
    inputDescription: '동일/상이한 마감일과 우선순위를 가진 5개 이상의 할 일 배열 정렬',
    expectedDescription: '1차 마감일 빠른 순 ➔ 2차 우선순위 높은 순 ➔ 3차 등록일시 순으로 정확히 정렬 (T06-C20 충족)',
    boundaryNote: '타이브레이커(마감일 및 우선순위가 같을 때) 생성순 정렬 결정론적 유지',
    passedInA: true,
    passedInB: true,
  },
  {
    id: 'T06-TEST-06',
    name: '실행 기록 저장 시 원래 계획 값(예상 시간) 불변 보존 검증 (T06-C27)',
    category: 'storage',
    inputDescription: '예상 시간 60분인 할 일에 실제 소요 시간 95분인 실행 기록(시작/종료/막힘이유) 저장',
    expectedDescription:
      '실행 기록에 T06-C23~C26 정상 저장되며, 할 일의 원래 예상시간 60분은 변조되지 않고 100% 보존 (T06-C27 충족)',
    boundaryNote: '실행 기록 테이블과 할 일/계획 테이블의 독립 스토리지 분리',
    passedInA: true,
    passedInB: true,
  },
  {
    id: 'T06-TEST-07',
    name: '완료 버튼 연타 시 동일 멱등키에 의한 중복 저장 방어 검증 (T06-C21, T06-C22)',
    category: 'resilience',
    inputDescription: '동일한 idempotency_key를 가진 실행 기록 저장 요청을 2회 연속 동시 병렬 발송',
    expectedDescription:
      '실행 기록은 1건만 저장되고, 2번째 요청은 중복 방어(isDuplicate=true)되며 완료 수도 정확히 1만 증가',
    boundaryNote: '네트워크 지연 및 더블클릭 레이스 컨디션 완벽 방어',
    passedInA: true,
    passedInB: true,
  },
  {
    id: 'T06-TEST-08',
    name: '돌아보기 마감 지연 수 집계 및 완료 건 중복 계산 배제 검증 (T06-C30)',
    category: 'boundary',
    inputDescription: '마감일이 어제인 미완료 건 1개, 마감일이 어제인 이미 완료된 건 1개, 오늘 건 1개',
    expectedDescription: '돌아보기 지연 수는 정확히 1건이며, 이미 완료된 건은 지연으로 두 번 세지 않음 (T06-C30 충족)',
    boundaryNote: 'Asia/Seoul 시간대 기준 현재 날짜(today)와 마감일(due_date) 엄격 비교',
    passedInA: true,
    passedInB: true,
  },
  {
    id: 'T06-TEST-09',
    name: '돌아보기 오차 분석(실제시간 - 예상시간) 및 4대 지표 무결성 검증 (T06-C28, C29, C31, C32)',
    category: 'analysis',
    inputDescription: '예상 합계 120분, 실제 합계 150분, 막힌 이유 기재 건 1건이 포함된 할 일 세트',
    expectedDescription: '계획 수, 완료 수, 막힘 수 정확 계산 및 시간 오차 varianceMinutes = +30분 정확 산출',
    boundaryNote: '할 일이 없거나 실행 기록이 없을 때 0분 기본값 반환',
    passedInA: true,
    passedInB: true,
  },
  {
    id: 'T06-TEST-10',
    name: 'XSS 스크립트 문자열 안전 렌더링 및 전체 데이터 단일 JSON 내보내기 검증',
    category: 'security',
    inputDescription: '<script>alert("xss")</script> 악성 문자열 저장 및 exportFullData() 호출',
    expectedDescription:
      '스크립트 태그가 실행되지 않고 일반 텍스트로 보존되며, 5개 테이블이 포함된 단일 JSON 파일 내보내기 완결 (T06-C36, T06-C57)',
    boundaryNote: '비밀키(service_role) 노출 0건 및 JSON 파싱 유효성 100%',
    passedInA: true,
    passedInB: true,
  },
];
