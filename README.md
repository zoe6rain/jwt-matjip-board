# 맛집 후기 게시판

웹서비스설계 JWT 게시판 과제입니다. 누구나 후기를 읽을 수 있고, 로그인한 사용자만 후기를 쓰며, 본인이 쓴 후기만 수정·삭제할 수 있습니다.

## 작성자와 서비스 소개

- 학번 / 이름: 202446609 / 곽우현
- 서비스 목적과 대상 사용자: 다녀온 맛집의 후기를 남기고 공유하는 게시판입니다. 맛집 정보를 찾는 사람은 로그인 없이 후기를 읽을 수 있고, 후기를 쓰려는 사용자는 로그인해서 작성합니다. 글을 쓴 사람만 자기 후기를 고치거나 지울 수 있습니다.
- 선택한 기술: React + Express
- 주요 기능: 공개 목록·상세 조회, JWT 로그인, 로그인 사용자의 글 작성, 작성자 본인 글 수정·삭제, 토큰 만료·로그아웃 처리

## 보고서와 테스트 증거

- [구현 보고서 PDF](docs/report.pdf)
- [테스트 증거](docs/evidence/)

## 프로젝트 구조

```text
.
├── README.md
├── .gitignore
├── backend-express/   # Express 서버 (src/auth.js가 JWT 구현)
├── frontend-react/    # React + Vite 화면 (src/api.js, src/main.jsx)
├── tools/             # 제공된 API 검사 프로그램 check_api.py
└── docs/
    ├── report.pdf
    └── evidence/      # 테스트 캡처
```

## 실행 환경

| 항목 | 사용 버전 |
|---|---|
| 운영체제 | Windows (빌드 10.0.26300), PowerShell 7.6.9 |
| 프론트 런타임 Node.js | v24.21.0 |
| 백엔드 런타임 | Node.js v24.21.0 |
| 프레임워크 | React 19.3.0, Vite 8.3.4, Express 5.3.0, jsonwebtoken 9.0.3, dotenv 18.0.7, sql.js 1.14.2 |
| 데이터 저장 | SQLite (sql.js, 파일 `backend-express/data/board.sqlite`) |
| 확인한 브라우저 | Chrome 156 |

## 설치와 실행

PowerShell 기준입니다. 터미널 두 개(백엔드, 프론트)를 사용합니다.

### 1 저장소 복제

```sh
git clone https://github.com/zoe6rain/jwt-matjip-board.git
cd jwt-matjip-board
```

### 2 백엔드 준비와 실행 (터미널 A)

```powershell
cd backend-express
npm ci
Copy-Item .env.example .env
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

- 마지막 명령이 출력한 64자리 글자를 복사해서, 방금 만든 `.env` 파일의 `JWT_SECRET=` 뒤에 붙여 넣고 저장합니다. 이 값은 내 컴퓨터에서만 쓰고 GitHub에 올리지 않습니다.
- 환경설정 예시 파일: `backend-express/.env.example` (실제 `.env`는 `.gitignore`로 제외)
- JWT_SECRET이 비었거나 예시 그대로이거나 64자리 16진수가 아니면 서버가 시작되지 않습니다.
- TOKEN_TTL: 기본 90초. 만료 테스트용으로 줄이려면 PowerShell에서 `$env:TOKEN_TTL = "3"`을 입력한 뒤 `npm start` 합니다. 끝나면 `Remove-Item Env:TOKEN_TTL`로 되돌립니다.

```powershell
npm start
```

- 백엔드 주소: http://127.0.0.1:8000
- 정상 실행 확인: 브라우저에서 http://127.0.0.1:8000/api/health 를 열어 `status`가 `ok`인지 확인합니다.

### 3 프론트 빌드와 로컬 실행 (터미널 B)

백엔드를 켜 둔 상태에서 새 터미널을 엽니다.

```powershell
cd frontend-react
npm ci
npm run build
npm run preview
```

- 최종 확인 주소: http://127.0.0.1:4173
- 개발 중 실행: `npm run dev`, http://127.0.0.1:5173
- API 연결: 브라우저가 `/api`로 보낸 요청을 Vite가 http://127.0.0.1:8000 백엔드로 전달합니다(`frontend-react/vite.config.js`의 `server.proxy`, `preview.proxy`).
- 종료: 두 터미널에서 각각 Ctrl+C
- 코드 변경 후: 프론트는 `npm run build` 후 preview를 다시 실행하고, 백엔드는 Ctrl+C 후 `npm start`로 다시 시작합니다.

### 4 테스트 계정과 DB

| 사용자 | 이메일 | 실습용 비밀번호 |
|---|---|---|
| Alice | alice@class.test | Classroom!2026 |
| Bob | bob@class.test | Classroom!2026 |

- SQLite 파일은 서버를 처음 켤 때 `backend-express/data/board.sqlite`로 자동 생성됩니다.
- DB 초기화: 백엔드 서버를 끈 뒤 `backend-express/data/board.sqlite` 파일만 삭제하고 다시 실행합니다. 기존 글이 지워집니다.
- 서버 재시작 후 데이터 유지 확인: 서버를 Ctrl+C로 껐다가 다시 켠 뒤에도 Bob이 쓴 글이 목록에 남아 있었습니다(보고서 T15).

위 계정은 과제 전용 테스트 계정입니다. 실제 서비스 계정 정보나 서버 비밀 키는 기록하지 않았습니다.

## 구현 완료 범위

| 기능 | 완료 여부 | 주요 파일 또는 함수 |
|---|---|---|
| 공개 목록과 상세 | 완료 | `backend-express/src/app.js`, `frontend-react/src/api.js` (`api.list`, `api.detail`) |
| 로그인과 JWT 발급 | 완료 | `backend-express/src/auth.js` `issueToken`, `frontend-react/src/api.js` `login` |
| JWT 검증과 내 정보 조회 | 완료 | `backend-express/src/auth.js` `currentUserId`, `api.me` |
| 글 작성과 작성자 저장 | 완료 | `app.js` 글 등록 라우트가 `currentUserId`로 작성자를 정함 |
| 본인 글 수정·삭제 | 완료 | `auth.js` `assertOwner`, `api.js` `canEdit` |
| 토큰 만료와 로그아웃 | 완료 | `api.js` `request`(401이면 로그인 상태 해제), 로그아웃 버튼 |
| 입력 오류와 권한 오류 처리 | 완료 | `app.js` 입력 검사, `api.js`의 오류 문구 |

알려진 문제와 미완성 기능: 없음. 로그인 상태(토큰)는 브라우저 메모리에만 두기 때문에 새로고침하면 사라집니다(과제 요구 사항).

## 테스트 방법과 결과 요약

- 자동 검사: `python tools/check_api.py --mode final` (저장소 루트에서 실행, 백엔드 켜 둔 상태) → 40개 통과. `TOKEN_TTL=3`으로 백엔드를 켜고 `--expiry`를 붙이면 48개 통과(만료 GET/POST/PUT/DELETE 포함).
- 화면에서 직접 확인(수동): Alice/Bob 로그인, 남의 글에서 수정·삭제 버튼 숨김, 글 작성·수정·삭제, 로그아웃, 새로고침, 실제 토큰 만료 안내(90초 대기), 서버 재시작 후 글 유지.
- Alice/Bob 권한 구분: Bob 토큰으로 Alice 글 수정·삭제 시 403 FORBIDDEN, 글은 그대로입니다.
- HTTP 상태와 오류 code: 200·201·204, 400 BAD_INPUT, 401 TOKEN_REQUIRED·INVALID_TOKEN·TOKEN_EXPIRED·INVALID_CREDENTIALS, 403 FORBIDDEN, 404 NOT_FOUND를 확인했습니다.
- 토큰 없음·변조·만료: 각각 401 TOKEN_REQUIRED, 401 INVALID_TOKEN, 401 TOKEN_EXPIRED이고 데이터는 바뀌지 않았습니다.
- 전체 T01~T17 결과와 증거: [보고서](docs/report.pdf)의 테스트 결과 절

직접 수행한 결과만 기록했습니다. 화면 캡처 일부는 제목을 "맛집 후기 게시판"으로 바꾸기 전에 찍어서 화면 제목이 "우리의 기록"으로 보입니다. 제목 문구만 바뀐 것이고 로그인·권한 코드는 그대로입니다.

## 핵심 구현 설명

1. 로그인: 화면이 `POST /api/auth/login`을 보내면 서버가 `issueToken`으로 HS256 JWT(sub, exp, iss, aud)를 만들어 돌려줍니다.
2. 토큰 보관·전송: 화면은 받은 토큰을 `api.js`의 변수(메모리)에만 두고, 요청마다 `Authorization: Bearer <토큰>` 헤더로 보냅니다. 토큰이 없으면 헤더를 보내지 않습니다. 401을 받으면 로그인 상태를 지웁니다.
3. 서버 검증: `currentUserId`가 헤더에서 토큰을 꺼내 서명·알고리즘·만료·iss/aud를 확인하고, 사용자가 실제 있는지 본 뒤 id를 돌려줍니다. 토큰이 없으면 TOKEN_REQUIRED, 변조되면 INVALID_TOKEN, 만료되면 TOKEN_EXPIRED(모두 401)입니다.
4. 작성자 권한: 수정·삭제 때 `assertOwner`가 로그인한 사용자와 글쓴이를 비교해 다르면 403 FORBIDDEN을 보냅니다. 화면의 `canEdit`은 버튼을 숨기기만 하며 실제 검사는 서버가 합니다.

상세 설명은 보고서의 핵심 코드 절에 있습니다.

## AI 활용 요약과 참고 자료

- AI 사용 여부: 사용
- 도구와 사용 목적: Claude(Anthropic). 구현 순서 안내, `auth.js`·`api.js`·`main.jsx` 코드 초안과 테스트 명령 제안, 보고서 정리에 사용했습니다.
- 반영 위치와 직접 수정·검증한 내용: AI가 제안한 코드와 명령은 제가 직접 붙여 넣어 실행했고, 터미널 결과와 화면 캡처로 확인했습니다. 실행 중 생긴 실패(저장하지 않아 403 검사가 적용되지 않은 일, AI 초안의 응답 모양 오류 등)도 보고서에 그대로 적었습니다.
- 상세 활용 기록: 보고서의 AI 활용 절
- 참고한 수업 자료·외부 코드·공식 문서: 수업 자료 "06 JWT 로그인", 과제 제공 문서(`docs/`)와 검사 프로그램 `tools/check_api.py`

## 제출 확인

- [x] README의 안내 문구를 실제 내용으로 교체했다.
- [x] 새 폴더에 clone하여 README만으로 설치·환경설정·빌드·로컬 실행했다.
- [x] 4173번 빌드 화면에서 API 연결과 주요 기능을 확인했다.
- [ ] GitHub에서 보고서와 증거 링크가 열린다.
- [x] 교수자가 저장소를 열람·복제할 수 있다.
- [x] 비밀 키·실제 토큰·DB·node_modules·.venv·target을 커밋하지 않았다.
- [ ] 최종 push 후 저장소 URL과 제출 기준 커밋 SHA를 LMS에 제출했다.
