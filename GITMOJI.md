# 🎨 Gitmoji & Develop Commit 컨벤션 가이드

> **참고 문서**: [Notion Develop Commit Convention](https://app.notion.com/p/Develop-commit-1131d1b0805580a59dedf8aa2d41b11c#1131d1b080558036a0e5fb8c0a40f46f)

본 프로젝트는 일관되고 명확한 형상 관리를 위해 **Gitmoji + Conventional Commits** 기반의 커밋 컨벤션을 적용합니다.

---

## 📋 Git Commit 템플릿 설정 및 커밋

로컬 Git 환경에 템플릿을 등록하면 `git commit` 실행 시 컨벤션 가이드와 템플릿 힌트가 자동으로 표시됩니다:

```bash
git config --local commit.template .gitmessage.txt
git commit
```

---

## 📐 커밋 메시지 구조 - Commit Structure

```text
<Gitmoji> <Type>: <Subject>

[Body] - 선택사항
- 변경된 핵심 내용
- 변경 이유 및 해결 배경

[Footer] - 선택사항
Resolves: #123
Related to: #456
```

---

## 📌 커밋 메시지 핵심 작성 규칙

1. **첫 영문 글자 대문자화**: 커밋 타입 및 첫 영문 단어는 반드시 대문자로 작성합니다 (예: `Feat`, `Fix`, `Docs`, `Refactor`, `Style`, `Chore` 등).
2. **특수문자 제한**: 커밋 메시지(제목 및 본문)에는 작은따옴표 및 괄호 문자를 포함하지 않습니다.
3. **제목과 본문 분리**: 제목과 본문 사이에는 반드시 **한 줄의 빈 줄**을 둡니다.
4. **제목 50자 제한**: 제목은 50자 이내로 핵심 내용만 간결하게 작성합니다.
5. **마침표 금지**: 제목 끝에는 마침표를 붙이지 않습니다.
6. **개조식 서술**: ~추가, ~수정, ~구현, ~개선, ~삭제 등의 명확한 어조로 작성합니다.
7. **본문 72자 줄바꿈**: 본문 작성 시 가독성을 위해 각 줄은 72자 이내로 줄바꿈합니다.
8. **What과 Why에 집중**: 코드 자체로 알 수 있는 How보다 **무엇을, 왜** 변경했는지에 집중하여 기술합니다.
9. **이슈 참조**: 꼬리말에는 관련된 이슈 번호를 명시합니다 (`Resolves: #번호`, `Closes: #번호`, `Fixes: #번호`).

---

## 🎯 Gitmoji & Commit Type 매핑 표

| Gitmoji | 코드                          | 커밋 타입  | 설명 및 용도                                    |
| :------ | :---------------------------- | :--------- | :---------------------------------------------- |
| ✨      | `:sparkles:`                  | `Feat`     | 새로운 기능 추가 - 새 로직, 컴포넌트 개발       |
| 🐛      | `:bug:`                       | `Fix`      | 버그 및 예외 오류 수정                          |
| 🎨      | `:art:`                       | `Style`    | UI, 스타일, CSS, 마크업 수정 - 동작 변경 없음   |
| ♻️      | `:recycle:`                   | `Refactor` | 코드 리팩토링 - 기능 변경 없는 구조 개선        |
| 📝      | `:memo:`                      | `Docs`     | 문서 작성 및 수정 - README, 주석, 가이드        |
| ⚡️      | `:zap:`                       | `Perf`     | 성능 개선 및 렌더링 최적화                      |
| 🔧      | `:wrench:`                    | `Chore`    | 빌드 및 환경 설정 파일 수정 - Vite, Prettier 등 |
| 📦      | `:package:`                   | `Build`    | npm 의존성 패키지 추가, 수정, 삭제              |
| 🧪      | `:test_tube:`                 | `Test`     | 테스트 코드 추가, 수정, 리팩토링                |
| 🚀      | `:rocket:`                    | `Deploy`   | 배포 및 인프라 관련 작업                        |
| 🔥      | `:fire:`                      | `Remove`   | 불필요한 코드, 파일, 더미 데이터 삭제           |
| 🚚      | `:truck:`                     | `Move`     | 파일 또는 폴더 이동, 이름 또는 경로 변경        |
| 🔒      | `:lock:`                      | `Security` | 보안 취약점 패치 및 보안 설정                   |
| 🔀      | `:twisted_rightwards_arrows:` | `Merge`    | 브랜치 병합 - Branch Merge                      |
| 🎉      | `:tada:`                      | `Init`     | 프로젝트 초기 생성 및 최초 커밋                 |
| ⏪      | `:rewind:`                    | `Revert`   | 이전 커밋 되돌리기 - Revert                     |

---

## 💡 커밋 메시지 작성 예시

```text
✨ Feat: CSV 및 TXT 파일 탐색기 컴포넌트 추가

- 표준 레퍼런스 코드 영역에 다중 파일 뷰어 기능 도입
- CSV 파일 실시간 표 뷰어 및 검색 필터 구현

Resolves: #12
```

```text
🎨 Style: 상단 메트릭 뱃지 제거 및 여백 조정

- 실습 아티클, 총 조회수, 공감수 지표 영역 삭제
- 헤드라인 및 추천 카드 간격 최적화
```

```text
🔧 Chore: Notion Develop-commit 규격 반영 Git 템플릿 설정 추가
```
