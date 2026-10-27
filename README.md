# 임채환 포트폴리오 — portfolio-web

React + Vite로 만든 정적 프런트엔드입니다. 서버 코드는 없고, `dist/`를 어떤 정적 서버로든 서빙하면 됩니다.

## 시안(variants)

시안마다 경로가 따로 있습니다. 마음에 드는 시안을 골라 그쪽을 고도화하는 방식입니다.

| 경로 | 시안 | 특징 |
|---|---|---|
| `/` | 목록 | 모든 시안 카드 |
| `/a/` | 시트 & 스택 | Kanit · 회청색 그라데이션 · 시트 전환 · 카드 스택 |
| `/b/` | 리퀴드 글래스 | Instrument Serif + Barlow · 리퀴드 글래스 · 페이드 루프 영상 · 단어 블러 인 |
| `/c/` | 인사이드 아웃 | Space Grotesk · VEYRA 인터랙티브 카 · 엔진/배터리/도장/휠 = 백엔드 은유 · 사양서 + 사례 드로어 |
| `/d/` | 다크 에디토리얼 | Inter + Instrument Serif · 000→100 로딩 카운터 · HLS 히어로 영상 · 벤토 사례 · 핀 고정 패럴랙스 갤러리 · GSAP 마키 |
| `/e/` | B + D 통합 | D의 뼈대(벤토 · 고정 패럴랙스 갤러리 · 마키) + B의 메시지 · 근거 카드 · 역량 · 기록 차트 |

문구는 한국어 중심입니다. 기술 이름·코드 경로·영문 이름처럼 영어가 자연스러운 것만 영어로 남겼습니다. 한글 제목은 영문 세리프 이탤릭 대신 Pretendard(`.ko-display`)로 표시합니다. 한글 글리프가 없는 서체에 이탤릭을 걸면 가짜 기울임이 생기기 때문입니다.

새 시안 추가: `src/variants/<키>/App.tsx`를 만들고 `src/variants/registry.ts`에 한 줄 추가하면 `/<키>/`로 열립니다. 데이터(`src/data/content.ts`)와 사례 데모(`src/demos/*`)는 모든 시안이 공유합니다.

## 실행

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ 생성
npm run preview    # 빌드 결과 확인 (http://localhost:4173)
npm run typecheck  # 선택. src/vendor 안의 Bklit 원본에서 미사용 변수 경고 1건이 나옵니다.
```

중립 데모 이미지 다시 찍기: `npm run build && npx vite preview --port 4173` 후 `node scripts/capture-tech.mjs` (PNG로 저장되므로 webp로 바꾸거나 `src/data/tech.ts`의 확장자를 맞추세요).

Node 20 이상을 권장합니다(개발은 Node 22에서 확인).

## 배포

### Docker (nginx)

```bash
docker build -t lch-portfolio .
docker run -d -p 8080:80 --name portfolio lch-portfolio
# http://localhost:8080, 헬스체크: /healthz
```

`nginx.conf`는 SPA fallback, `/assets/` 장기 캐시, nginx 자체 `/healthz`를 포함합니다.

### 정적 호스팅

`npm run build` 후 `dist/`를 Vercel·Netlify·S3+CloudFront·GitHub Pages 등에 올리면 됩니다. 라우팅이 없는 단일 페이지라 별도 설정이 필요 없습니다.

## 구조

```
src/
  data/content.ts      ← 모든 문구·사례·수치. 내용 수정은 여기만 고치면 됩니다.
  components/          Hero(+FloatingNav), ui(Sheet·StackingCards 보조·Magnet·AnimatedText·버튼 등), icons
  sections/            Intro(마키·About·How I work), Cases(카드 스택·오버레이), Flow(Bklit 차트), More(Projects·Toolkit), Contact
  public/marquee/      데모 패널 캡처(scripts/capture-marquee.mjs로 생성)
  demos/               사례별 인터랙티브 패널 6개
  vendor/bklit/        Bklit UI 차트 소스(MIT) — 복사본, 아래 '수정 사항' 참고
  lib/utils.ts         cn() (Bklit 의존)
```

## 디자인 언어와 연출

두 번째 레퍼런스 브리프("3D Creator portfolio")의 색·폰트·스크롤 연출을 포트폴리오 내용에 맞춰 옮겼습니다.

- **색**: 바탕 `#0C0C0C`, 글자 `#D7E2EA`, 큰 제목은 `#646973 → #BBCCD7` 세로 그라데이션(`.hero-heading`), 주요 버튼은 보라→주황 그라데이션 알약(`.pill-gradient`). 흰 시트(`#FFFFFF`)와 검정 시트가 번갈아 나옵니다.
- **폰트**: Kanit 300–900(영문). Kanit에 한글이 없어 한글은 Pretendard로 표시됩니다. 둘 다 `@fontsource`·npm으로 자체 호스팅.
- **모서리**: 시트 윗모서리 60px, 카드 40–60px, 버튼은 완전 원형.

| 연출 | 위치 | 구현 |
|---|---|---|
| 꽉 차는 제목 + 마그넷 영상 | 히어로 | 제목 폭을 측정해 화면 너비에 맞춤(`FitLine`), 영상은 마우스를 따라 움직이고(`Magnet`) `mix-blend-screen`으로 배경에 녹임 |
| 히어로가 가라앉음 | 히어로 → 다음 섹션 | 스크롤에 따라 히어로가 내려가며 어두워짐 (Motion `useScroll`) |
| 반대로 흐르는 두 줄 띠 | 마키 | 스크롤 위치로 두 줄을 서로 반대 방향 이동. 이미지는 이 사이트의 데모 패널 캡처 |
| 글자 단위 리빌 | About, Contact | 글자마다 스크롤 진행에 맞춰 0.2 → 1 (`AnimatedText`) |
| 시트가 덮어 올라옴 | How I work, Cases, Flow, Projects, Toolkit, Contact | 섹션이 앞 섹션 위로 겹쳐 올라오며 0.93 → 1로 커짐 (`Sheet`) |
| 쌓이며 작아지는 카드 | Cases 6개, Projects 3개 | sticky 카드가 다음 카드에 덮이며 축소·어두워짐 (`StackingCards`) |
| 사례 상세 오버레이 | Cases의 OPEN CASE | 아래에서 올라오는 패널에 전체 설명 + 조작 가능한 데모 (Esc로 닫기) |
| 중앙에서 퍼지는 글자 | Let’s talk | anime.js `splitText` + `stagger({ from: "center" })` |
| 플로팅 내비 | 히어로 이후 | 알약 모양 내비가 위에서 내려옴 |

`prefers-reduced-motion`에서는 시트 확대·마그넷·anime.js 연출을 끄고 전환 시간을 0으로 줄입니다.

### 마키 이미지 다시 만들기

`public/marquee/*.webp`는 이 사이트의 사례 패널을 자동으로 조작해 찍은 캡처입니다. 데모를 고친 뒤 갱신하려면:

```bash
npm run build && npx vite preview --port 4173 &
npx playwright install chromium   # 처음 한 번
node scripts/capture-marquee.mjs  # public/marquee/*.png 생성
```

PNG를 webp로 바꾸거나 그대로 쓰려면 `src/data/marquee.ts`의 확장자를 맞추면 됩니다.

### 브리프와 다르게 한 부분

| 브리프 | 이 사이트 | 이유 |
|---|---|---|
| 인물 사진(투명 PNG) + 마그넷 | 꽃 영상 + 마그넷 | 사진 대신 앞서 고른 히어로 영상을 유지 |
| 마키에 motionsites 미리보기 GIF 21개 | 이 사이트 데모 캡처 15장 | 남의 작업물을 내 포트폴리오에 전시하지 않기 위해 |
| 3D 오브젝트 이미지 4개 | 기술 키워드 카드 4개 | 이미지 자산은 브리프 작성자의 것 |
| 프로젝트 카드 이미지 3장 | 데모 캡처 + 설명 | 같은 이유 |
| Services 5개 | How I work 4개, Toolkit 4그룹 | 포트폴리오 내용에 맞춤 |
| 섹션 순서 5개 | 히어로 · 마키 · About · How I work · Cases · Also shipped · Flow · Projects · Toolkit · Contact | 포트폴리오 내용 반영 |
| React 18 / Tailwind 3 / framer-motion | React 19 / Tailwind 4 / motion | 기존 프로젝트 유지(동일 API) |
| Google Fonts `<link>` | `@fontsource/kanit` | 자체 호스팅 |

## 내용 작성 원칙 (공개용)

이 사이트는 공개 서빙을 전제로 `portfolio-analysis` 분석 패키지에서 문구를 다시 썼습니다.

- 커밋 SHA, Jira 링크, 내부 호스트·식별자, 고객 데이터는 넣지 않았습니다. 내부 시스템 이름은 "업무 백엔드" 등으로 일반화했습니다.
- 수치는 분모·의미와 함께만 씁니다. 96.75%는 정확도가 아니라 **추천 코드 제공률**입니다.
- "통합"은 주 개발 브랜치 반영이지 배포 증거가 아닙니다. 비영업시간 AI 상담은 사용자 확인에 따라 "실제 서비스 제공", 홈페이지 챗봇은 "개발 경험", WIKI는 "공동 기여"로 표시합니다.
- 보안 약점의 구체 내용(이미지에 설정이 남는 구조 등)은 공개 페이지에서 제외했습니다.
- 전화번호는 공개 페이지에서 뺐습니다. 필요하면 `content.ts`의 `profile`에 추가하세요.
- 회사 이름(리드넘버)과 재직 기간(2026.04—, 첫 커밋·첫 Jira 기준)은 `profile.company`, `profile.period`에서 바꿀 수 있습니다.
- 데모 패널의 데이터는 예시이며, 구조와 판단만 실제 작업을 따릅니다.
- 회사 밖 프로젝트 3개는 기존 Notion 포트폴리오에서 가져와 요약했습니다.

## 오픈소스·레퍼런스 고지

| 이름 | 사용 방식 | 라이선스 |
|---|---|---|
| [Motion](https://motion.dev) (`motion` npm) | 의존성 | MIT. 유료 Motion+ 기능은 쓰지 않음 |
| [anime.js](https://animejs.com) v4.5 | 의존성 | MIT |
| Instrument Serif · Barlow (시안 B) | 폰트(@fontsource) | SIL OFL 1.1 |
| [GSAP](https://gsap.com) 3.15 (시안 D) | 의존성(ScrollTrigger 포함) | GSAP Standard "no charge" License — 상업적 사용 포함 무료, 단 MIT는 아님. Webflow와 경쟁하는 노코드 빌더 제작 등 일부 용도 제한 |
| [hls.js](https://github.com/video-dev/hls.js) 1.7 (시안 D) | 의존성 | Apache-2.0 |
| Inter (시안 D) | 폰트(@fontsource) | SIL OFL 1.1 |
| Space Grotesk (시안 C) | 폰트(@fontsource) | SIL OFL 1.1 |
| [VEYRA interactive car](https://github.com/amirmushichge/veyra-interactive-car) v1.0.0 (시안 C) | 장면 코드·CSS·미디어 각색, `src/variants/c/LICENSE.veyra` 동봉 | MIT (Amir Mušić). 미디어는 저작자 권리 범위 내 MIT, AI 생성물 |
| [Bklit UI](https://github.com/bklit/bklit-ui) | 차트 소스 복사(`src/vendor/bklit`, LICENSE 동봉) | MIT. 별도 라이선스인 Bklit Studio는 사용하지 않음 |
| [lucide-react](https://lucide.dev) | 아이콘 | ISC |
| visx, d3-* | Bklit 의존성 | MIT / ISC |
| Kanit · Pretendard | 폰트(@fontsource, pretendard npm) | SIL OFL 1.1 |
| 레이아웃 브리프 2종 + 배경 영상 ([motionsites.ai](https://motionsites.ai)) | 구조·연출 참고, 영상은 브리프에 지정된 CloudFront URL을 그대로 재생 | MotionSites 이용약관: 프롬프트로 만든 사이트는 사용자 소유, 프롬프트·소스 자체의 재배포·재판매 금지, 영상 등 자산의 소유권은 MotionSites |
| [emilkowalski/skill](https://github.com/emilkowalski/skill) · [taste-skill](https://github.com/leonxlnx/taste-skill) | 원칙 참고, 코드 미포함 | MIT |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | 품질 기준 참고, 코드 미포함 | Apache-2.0 |

### 배경 영상 주의

- 영상(시안 A 1개, 시안 B 2개)은 MotionSites CDN(`d8j0ntlcm91z4.cloudfront.net`)에서 직접 재생합니다. 저장소에 파일을 복사하지 않았습니다.
- 해당 프롬프트를 쓸 수 있는 플랜인지, 그리고 영상 자산을 계속 그 주소로 써도 되는지는 본인 계정의 이용 조건으로 확인하세요. 주소가 바뀌거나 막히면 영상 없이 검은 배경으로 표시되도록 처리했습니다(`onError`).
- 영상을 바꾸려면 `src/components/Hero.tsx`의 `VIDEO_SRC`만 고치면 됩니다. 영상의 검은 배경은 `mix-blend-screen`으로 사라지므로, 검은 배경 위 밝은 피사체 영상이 잘 어울립니다.
- 이 저장소를 공개할 때 브리프 원문(프롬프트 텍스트)은 넣지 마세요. 약관상 재배포 금지 대상입니다.

## B · D · E — 기술 중심 문구

B, D, E는 회사명과 업무 도메인(세무·회계)을 빼고 기술 중심으로 읽히도록 별도 문구를 씁니다.

- 문구: `src/data/tech.ts`(사례 6개, 기록, 기타 작업, 프로필). 사실과 수치는 `content.ts`와 같고, 회사·도메인 표현만 일반화했습니다. A·C는 계속 `content.ts`를 씁니다.
- 데모 패널: `src/demos/copy.ts`의 `NeutralCopy` 컨텍스트가 켜지면 도메인 중립 문구(예: `partner-api/consent-history.resolve()`, `user-23`, "작업 완료 이벤트")로 바뀝니다. B·D·E 루트에서 켜고, A·C는 기존 문구 그대로입니다.
- 미리보기 이미지: 중립 문구 상태의 패널을 `scripts/capture-tech.mjs`로 찍어 `public/marquee-tech/`에 두었습니다(900px webp). 데모를 고친 뒤에는 이 스크립트로 다시 찍으면 됩니다.

## 시안 E — B + D 통합

B·D 비교 분석 결과를 반영한 통합안입니다. D를 뼈대로 쓰고 B의 강점을 옮겼습니다.

| 출처 | 가져온 것 |
|---|---|
| D | 다크 에디토리얼 톤(Inter · Pretendard · 블루 그라데이션), 알약 내비, 벤토 사례 + ←/→ 이동 오버레이, 그 밖의 작업 알약 리스트, 고정 패럴랙스 갤러리, 숫자 카운터, 개인 프로젝트 · 기술 스택, 뒤집힌 영상 + GSAP 마키 연락 섹션 |
| B | 히어로 메시지 "외부가 흔들려도 버티는 백엔드", "실제 서비스 제공 중" 배지, 6개 사례 · 4개 계층 근거 카드, 매일 다루는 기술 띠, 역량 3단(백엔드 · 배포·운영 · AI 시스템), 기록 섹션(Bklit 월별 차트 + 7개월 타임라인) |

D에서 고친 점

- 로딩 화면은 세션당 한 번만, 약 1.5초로 줄였습니다(`sessionStorage`, 실패해도 동작).
- hls.js는 영상이 필요할 때만 불러옵니다. Safari는 네이티브 HLS를 써서 라이브러리를 받지 않습니다. 시안 전용 JS가 약 717KB → 37KB로 줄었습니다(압축 전).
- 터치 기기에서는 사례 카드의 한 줄 설명이 항상 보입니다.
- 모바일 갤러리는 카드를 작게 하고 제목 패널을 카드 위에 올려 글자가 가려지지 않습니다.

## 시안 D — Dark Editorial

다섯 번째 브리프(motionsites.ai 계열 다크 포트폴리오)를 포트폴리오 내용에 맞춘 시안입니다.

| 브리프 | 이 사이트 |
|---|---|
| 로딩 화면 Design · Create · Inspire | Design · Build · Operate, 000→100 카운터와 진행 막대는 그대로 |
| 이름 + "A {role} lives in Chicago." | Chaehwan Lim + "A {Backend · Kotlin · Spring · GitOps · AI pipeline} engineer at 리드넘버." (거주지는 쓰지 않음) |
| Selected Works 4장 (7/5/5/7) | 사례 6장 (7/5 · 5/7 · 7/5), 이미지는 이 사이트의 데모 캡처, 클릭하면 문제·결정·결과 + 데모 오버레이(←/→로 이동) |
| Journal 4개 | Also shipped 6개(기타 작업)를 같은 가로 알약 형태로 |
| Explorations 6장 + Dribbble | 데모 패널의 비정상 경로 캡처 6장(클릭하면 확대) + GitHub |
| 20+ Years / 95+ Projects / 200% | 사례 6개 / 7개월 / 커밋 318개(merge 제외, 규모 참고용). 부풀린 숫자는 쓰지 않음 |
| (없음) | Personal builds(개인 프로젝트 3개) + 툴킷·학력 |
| "Available for projects" | "Open to conversations"(재직 중이라 문구 조정) |
| framer-motion · react-router-dom · tailwindcss-animate | 기존 `motion`(같은 API), 경로 기반 시안 전환, 애니메이션은 `d.css`의 keyframes |
| Google Fonts | `@fontsource/inter` + 기존 Instrument Serif 자체 호스팅 |

- 한글 제목에는 Instrument Serif 이탤릭을 쓰지 않습니다(한글 글리프가 없어 가짜 기울임이 생김). 이탤릭은 영문 단어에만 씁니다.
- 영상: 브리프에 지정된 Mux HLS 주소(`stream.mux.com/…m3u8`)를 hls.js로 그대로 재생합니다(Safari는 네이티브 HLS). 저장소에 파일은 없습니다. 재생이 안 되면 영상만 숨기고 남색 그라데이션 배경이 보입니다. 영상 자산의 사용 조건은 MotionSites 쪽 약관을 따릅니다(위 '배경 영상 주의'와 같음).
- 확인 환경: Chromium(Playwright) 1440×900, 768×1024, 390×844 — 가로 넘침·콘솔 에러 없음, 로딩 → 히어로 진입, 핀 고정·패럴랙스, 사례 오버레이 열기/다음/Esc 확인. 헤드리스 Chromium은 H.264를 디코딩하지 못해 영상 재생 자체는 실제 브라우저에서 확인이 필요합니다.
- `prefers-reduced-motion`에서는 로딩을 짧게, 패럴랙스 핀 고정과 마키를 끕니다.

## 시안 C — VEYRA 각색

`/c/` 상단 장면은 [VEYRA interactive car](https://github.com/amirmushichge/veyra-interactive-car) `v1.0.0`(MIT, Amir Mušić)을 각색했습니다. **원본을 그대로 재현한 것이 아니라 각색(adaptation)입니다.** 원본 라이선스는 `src/variants/c/LICENSE.veyra`, 고지는 `THIRD_PARTY_NOTICES.veyra.md`에 있습니다.

| 차 부위 | 백엔드 은유 | 내용 |
|---|---|---|
| Engine(보닛, hover 시 열림 → 클릭 시 상세) | Domain core | 실행 컨텍스트 · 전자신고 오케스트레이터 · 문자셋 fallback/부분 실패 |
| Battery(차체 아래) | State & async | 이벤트·이력 저장 · Redis Pub/Sub · RabbitMQ · 멱등성/처리 잠금 |
| Paint 5색 | Kustomize overlay | base · dev · feature flag · prod · rollback |
| Wheels 3종 | 배포 경로 | GKE·Argo CD · NCP 금융존 HTTPS · KT Cloud A100 배치 |

장면 아래(사양서 6개 사례 → 드로어 안 인터랙티브 데모, 원칙, 커밋 분포 로그북, 기타 작업, 개인 프로젝트, 툴킷, 연락처)는 이 사이트용으로 새로 만든 부분입니다. 사례마다 차 부품 역할(Steering, Drivetrain, Electrical bus, Test track, Shielded harness, Driver assist)을 붙였습니다.

원본에서 그대로 둔 것

- `public/media/` 이미지·영상: 원본과 바이트 동일(sha256 확인). 크기·압축·색·길이를 바꾸지 않았고 새로 생성하지 않았습니다. 원본 문서상 이 미디어는 AI 생성물입니다.
- `HoverVideo.tsx`: 원본과 동일. 장면 상태 머신(overview → entering → detail → returning), 타이밍·가드, 1672:941 좌표 평면 계산, 핫스폿 좌표, 외관 메뉴 동작.
- `veyra.css`: 원본 `index.css` 규칙 그대로.

바꾼 것

- 문구 전부(`content.ts`, `appearance.ts`, `AppearanceMenu.tsx` 캡션, 헤더·푸터).
- 폰트: Google Fonts → `@fontsource/space-grotesk`(400만), 한글은 Pretendard로 대체 표시.
- CSS: `:root` → `html[data-variant="c"]`로 범위 제한, `@tailwind` 지시문 제거, 요소 리셋(`button`, `a`, `svg` 등)을 `@layer base`로 옮김(공유 데모의 Tailwind 유틸리티가 덮이지 않도록). 사이트용 스타일은 파일 끝에 따로 추가.
- Escape: 사례 드로어가 열려 있으면 드로어를 먼저 닫습니다. 그 외에는 원본과 같습니다.
- CSS 변수(`--scene-width` 등)를 `main` 대신 바깥 래퍼에 둬서 아래 섹션도 같은 폭에 맞춥니다.

알려진 한계

- 원본에 문서화된 문제 그대로: 도장/휠 메뉴를 Escape로 닫은 직후 포커스가 핫스폿이 아니라 `body`로 갈 수 있습니다. 재현 범위를 지키려고 고치지 않았습니다.
- 확인 환경: Chromium(Playwright) 1440×900, 1280×720, 1920×1080, 768×1024, 390×844, 360×740. 헤드리스 Chromium은 H.264를 재생하지 못해, 테스트할 때만 hover 영상을 webm으로 바꿔 넣었습니다(저장소 파일은 원본 mp4). 실제 iOS Safari와 터치 기기에서는 확인하지 않았습니다.
- 원본 지시대로 LTX 등 생성 서비스는 쓰지 않았고, 사이트를 게시하거나 푸시하지 않았습니다.

### Bklit UI 수정 사항

`src/vendor/bklit/charts/bar-chart.tsx` — 세로 stacked 막대에서 y 도메인이 시리즈별 최댓값으로 계산돼 막대 윗부분이 잘리는 문제를, 데이터 포인트별 합계를 쓰도록 고쳤습니다(`[portfolio patch]` 주석). `components/shimmering-text.tsx`는 차트가 참조해 함께 복사했습니다.
