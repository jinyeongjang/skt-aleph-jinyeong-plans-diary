import { runAllFixedTests } from '../src/utils/testRunner.ts';

async function main() {
  console.log('===============================================================');
  console.log('  SKT ALEPH 과제 6: 사전 고정 10대 검사 CLI 자동 러너 (T06-C01~C83)');
  console.log('===============================================================\n');

  const results = await runAllFixedTests();

  let passedCount = 0;
  for (const r of results) {
    const mark = r.passed ? '✅ [PASS]' : '❌ [FAIL]';
    console.log(`${mark} ${r.testId} : ${r.name} (${r.executionTimeMs}ms)`);
    console.log(`    결과: ${r.actualOutput}`);
    if (!r.passed) {
      console.log('    로그:');
      r.logs.forEach((l) => console.log(`      ${l}`));
    }
    if (r.passed) passedCount++;
  }

  console.log('\n---------------------------------------------------------------');
  console.log(`  최종 결과: ${passedCount} / ${results.length} 검사 통과`);
  console.log('---------------------------------------------------------------');

  if (passedCount === results.length) {
    console.log('🎉 10대 사전 고정 검사 전수 100% 통과 완료! (T06 전수 통과)\n');
    process.exit(0);
  } else {
    console.error(`⚠️ ${results.length - passedCount}개의 검사가 실패했습니다.\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('검사 실행 중 치명적 예외:', err);
  process.exit(1);
});
