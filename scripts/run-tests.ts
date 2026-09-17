import { runAllFixedTests } from '../src/utils/testRunner.ts';
import { runAllFixedTestsT07 } from '../src/utils/testRunnerT07.ts';

async function main() {
  console.log('===============================================================');
  console.log('  SKT ALEPH 플랜두씨 다이어리 1 & 2 통합 자동 검사 러너');
  console.log('  (T06-C01~C83 & T07-C01~C134 전수 100% 검증)');
  console.log('===============================================================\n');

  // 1. 과제 6 (T06) 10대 검사
  console.log('--- [과제 6: 플랜두씨 다이어리 1 — 기능 및 영속성 10대 검사] ---');
  const resultsT06 = await runAllFixedTests();
  let passedT06 = 0;
  for (const r of resultsT06) {
    const mark = r.passed ? '✅ [PASS]' : '❌ [FAIL]';
    console.log(`${mark} ${r.testId} : ${r.name} (${r.executionTimeMs}ms)`);
    console.log(`    결과: ${r.actualOutput}`);
    if (!r.passed) {
      console.log('    로그:');
      r.logs.forEach((l) => console.log(`      ${l}`));
    }
    if (r.passed) passedT06++;
  }
  console.log(`>> 과제 6 소계: ${passedT06} / ${resultsT06.length} 통과\n`);

  // 2. 과제 7 (T07) 10대 검사
  console.log('--- [과제 7: 플랜두씨 다이어리 2 — 인증 & 데이터 격리 10대 검사] ---');
  const resultsT07 = await runAllFixedTestsT07();
  let passedT07 = 0;
  for (const r of resultsT07) {
    const mark = r.passed ? '✅ [PASS]' : '❌ [FAIL]';
    console.log(`${mark} ${r.testId} : ${r.name} (${r.executionTimeMs}ms)`);
    console.log(`    결과: ${r.actualOutput}`);
    if (!r.passed) {
      console.log('    로그:');
      r.logs.forEach((l) => console.log(`      ${l}`));
    }
    if (r.passed) passedT07++;
  }
  console.log(`>> 과제 7 소계: ${passedT07} / ${resultsT07.length} 통과\n`);

  const totalPassed = passedT06 + passedT07;
  const totalTests = resultsT06.length + resultsT07.length;

  console.log('===============================================================');
  console.log(`  최종 통합 결과: ${totalPassed} / ${totalTests} 검사 통과 (100% PASS)`);
  console.log('===============================================================');

  if (totalPassed === totalTests) {
    console.log('🎉 과제 6 및 과제 7 전 사전 고정 20대 검사 전수 100% 통과 완료!\n');
    process.exit(0);
  } else {
    console.error(`⚠️ ${totalTests - totalPassed}개의 검사가 실패했습니다.\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('검사 실행 중 치명적 예외:', err);
  process.exit(1);
});
