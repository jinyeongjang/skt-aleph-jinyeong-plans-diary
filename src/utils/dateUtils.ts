/**
 * 서울 표준시 (KST, Asia/Seoul, UTC+09:00) 기준 날짜 및 시간 유틸리티
 * 명세 준수: T06-C30
 */

export const SEOUL_TIMEZONE = 'Asia/Seoul';

/**
 * 서울 시간대 기준 오늘 날짜 (YYYY-MM-DD) 반환
 */
export function getSeoulTodayString(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: SEOUL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * 현재 서울 시간대 ISO 8601 문자열 반환
 */
export function getSeoulNowISO(): string {
  return new Date().toISOString();
}

/**
 * 서울 시간 기준 지연 여부 판정 (T06-C30)
 * - 완료되지 않은(pending) 할 일
 * - 마감일(due_date)이 서울 시간 오늘보다 앞선 경우
 * - 완료된 할 일은 지연으로 두 번 세지 않음
 */
export function isTodoDelayed(dueDate: string, status: string): boolean {
  if (status === 'completed') {
    return false;
  }
  const today = getSeoulTodayString();
  return dueDate < today;
}

/**
 * 두 시각 사이의 실제 소요 분 계산
 */
export function calculateMinutesDiff(startTimeIso: string, endTimeIso: string): number {
  const start = new Date(startTimeIso).getTime();
  const end = new Date(endTimeIso).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) {
    return 0;
  }
  return Math.round((end - start) / (1000 * 60));
}

/**
 * 분 단위를 가독성 있는 시간 문자열로 변환 (예: 90분 -> "1시간 30분")
 */
export function formatMinutes(minutes: number): string {
  if (minutes === 0) return '0분';
  const isNegative = minutes < 0;
  const absMin = Math.abs(minutes);
  const hrs = Math.floor(absMin / 60);
  const mins = absMin % 60;
  let text = '';
  if (hrs > 0) text += `${hrs}시간 `;
  if (mins > 0 || hrs === 0) text += `${mins}분`;
  return isNegative ? `-${text.trim()}` : text.trim();
}
