/* ------------------------------------------------------------------
   All copy lives here so it can be edited without touching layout.
   Public-safety rules applied (see README):
   - no commit SHAs, ticket links, internal hosts or identifiers
   - numbers are only used with their denominator and meaning
   - "통합" means merged into the main dev branch, not "deployed"
------------------------------------------------------------------- */

export const profile = {
  name: "임채환",
  nameEn: "Chaehwan Lim",
  role: "Backend Engineer",
  headline: ["구현을 넘어,", "배포와 운영 구조까지", "설계하는 백엔드 개발자"],
  intro:
    "Kotlin·Spring으로 세무·회계 자동화 서비스의 백엔드를 만듭니다. 홈택스·위하고처럼 응답이 불완전하고 부분 실패가 잦은 외부 연동을 단계와 상태로 나누는 일을 주로 맡았고, 그 코드가 GitOps·Kubernetes·네트워크를 지나 실제로 동작하는 지점까지 따라가 책임집니다.",
  email: "legoch16@gmail.com",
  github: "https://github.com/Chaehwan-l",
  githubLabel: "github.com/Chaehwan-l",
  company: "리드넘버",
  companyDesc: "세무·회계 자동화 플랫폼",
  period: "2026.04 — 현재",
};

export const principles = [
  {
    title: "실패 조건부터 설계합니다",
    body: "외부 시스템은 늦고, 틀리고, 중간에 끊깁니다. 단계·상태·재처리 지점을 먼저 정하고 기능을 올립니다.",
  },
  {
    title: "경계를 명시합니다",
    body: "누가 상태를 소유하고 누가 발송하는지. 책임을 나누면 장애 반경과 변경 반경이 함께 줄어듭니다.",
  },
  {
    title: "AI는 계약 안에 둡니다",
    body: "모델이 할 수 있는 일을 제한하고, 근거가 없으면 멈추고, 운영 경로와 실험 경로를 분리합니다.",
  },
  {
    title: "코드가 도착하는 곳까지",
    body: "이미지, 매니페스트, 설정 우선순위, 인증서와 방화벽. 배포는 코드의 마지막 단계가 아니라 일부입니다.",
  },
];

export type CaseStatus = "integrated" | "service" | "local" | "joint";

export type CaseStudy = {
  id: string;
  area: string;
  title: string;
  tagline: string;
  period: string;
  role: string;
  status: { kind: CaseStatus; label: string };
  stack: string[];
  problem: string;
  decisions: string[];
  result: string;
  limit: string;
  demo: "agency" | "pipeline" | "fanout" | "gpu" | "https" | "chatbot";
};

export const cases: CaseStudy[] = [
  {
    id: "agency",
    area: "도메인 · 외부 연동",
    title: "세무대리인 전환과 수임 상태 모델링",
    tagline: "외부 응답을 ‘최신값’으로 합치지 않고, 사건 한 건의 일관성을 지켰습니다.",
    period: "2026.09 — 10",
    role: "설계 · 구현",
    status: { kind: "integrated", label: "주 개발 브랜치 통합" },
    stack: ["Kotlin", "Spring Boot", "홈택스 연동", "Feature flag", "Kustomize"],
    problem:
      "세무대리인 계정이 바뀌면 수십 개 스크래핑·신고 경로에 흩어진 ‘누구의 ID로 실행하는가’ 규칙을 한꺼번에 바꿔야 했습니다. 홈택스는 같은 사업장의 신청·동의·해임 이력을 여러 행으로 돌려주고, 법인 응답은 식별자 형태가 달랐습니다.",
    decisions: [
      "고객 조회 식별자와 신고를 실행하는 대리인 ID를 분리하고, 실행 컨텍스트와 resolver로 결정 규칙을 한 곳에 모았습니다.",
      "코드 배포와 동작 전환을 분리했습니다. GitOps 설정의 flag, 기존 경로 fallback, 실제 변경 전 dry-run 리포트를 두었습니다.",
      "복수 이력은 날짜 필드별 최대값을 합치지 않고, 유효한 동의 건을 우선해 ‘실제 한 건’을 고른 뒤 그 행의 값을 함께 쓰도록 바꿨습니다.",
    ],
    result:
      "대리인 결정 규칙이 호출부마다 흩어지지 않게 됐고, 단계적 전환과 롤백이 설정 변경으로 가능해졌습니다. 서로 다른 건의 날짜가 섞여 존재하지 않는 상태가 만들어지는 판정 오류를 막았습니다.",
    limit:
      "첫 공통화 변경이 134개 파일에 걸칠 만큼 영향 반경이 컸습니다. 공통화의 결과이면서 기존 결합도의 증거였고, 이후에는 더 작은 단계로 나눠 진행하는 편이 낫다는 교훈을 얻었습니다.",
    demo: "agency",
  },
  {
    id: "pipeline",
    area: "배치 · 파일 처리",
    title: "전자신고 파일 생성과 제출 파이프라인",
    tagline: "유형별로 복제되던 생성 코드를 단계별 책임과 공통 오케스트레이션으로 바꿨습니다.",
    period: "2026.06 — 10",
    role: "설계 · 구현",
    status: { kind: "integrated", label: "주 개발 브랜치 통합" },
    stack: ["Kotlin", "Strategy / Builder", "Batch", "RabbitMQ", "Charset"],
    problem:
      "급여·사업소득·일용직·부가세 전자파일은 흐름은 같지만 레코드 규격이 달랐습니다. 대상 선정·조립·인코딩·암호화·제출이 유형별 코드에 반복됐고, CP949로 표현할 수 없는 한글 확장문자 하나가 batch 전체를 실패시킬 수 있었습니다.",
    decisions: [
      "대상 선정 → 레코드 빌더 → 조립 → 문자셋 → 암호화 → 제출 → 검증으로 단계를 나누고, 상위 orchestrator가 batch 단위로 묶게 했습니다.",
      "인코딩 판단을 별도 resolver로 분리했습니다. CP949로 표현할 수 없으면 X-WINDOWS-949로 전환하는 정책을 모든 유형이 공유합니다.",
      "간이지급명세서는 실제 화면 호출 경로를 위하고 생성 API 기반 공통 마감·제출 흐름에 연결하고, 담당자별 큐 순서를 분산했습니다.",
    ],
    result:
      "새 파일 유형은 빌더와 매퍼만 추가하면 됩니다. 인코딩·암호화 실패가 도메인 흐름 밖으로 격리됐고, 항목별 결과가 남아 부분 실패를 구체적으로 돌려줄 수 있습니다.",
    limit:
      "전자파일 도메인이 큰 모듈과 배포 단위를 공유합니다. 외부 단계가 많은 만큼 workflow 상태 영속화와 보상 전략을 더 명시할 여지가 있습니다.",
    demo: "pipeline",
  },
  {
    id: "fanout",
    area: "비동기 · 실시간",
    title: "다중 인스턴스 업무 알림 플랫폼",
    tagline: "사용자가 어느 서버에 연결돼 있든, 알림은 도착해야 합니다.",
    period: "2026.04 — 05",
    role: "설계 · 구현",
    status: { kind: "integrated", label: "주 개발 브랜치 통합" },
    stack: ["Spring", "Redis Pub/Sub", "SSE", "FCM", "Cursor pagination"],
    problem:
      "세금신고·지방세·STT·채팅 지연 등 여러 업무가 알림을 만들었지만 이벤트 원인과 표시 문구가 결합돼 있었습니다. 서버가 여러 대가 되면 SSE 연결이 붙은 인스턴스에서만 알림이 전달될 수 있었습니다.",
    decisions: [
      "업무 이벤트를 먼저 영속화하고, 표시 템플릿과 전달 채널을 분리했습니다.",
      "인스턴스 간 전달 경계로 Redis Pub/Sub를 두고, FCM과 SSE가 같은 이벤트 모델을 공유하게 했습니다.",
      "목록은 DB 기준으로 조회하고 SSE는 ‘새 알림이 있다’는 신호로만 썼습니다.",
    ],
    result:
      "새 업무 알림은 이벤트와 템플릿만 확장하면 됩니다. 연결 위치와 무관하게 전달되고, 발생·저장·전달·표시의 실패 지점을 따로 추적할 수 있습니다.",
    limit:
      "이벤트 저장과 외부 전달의 원자성(outbox)과, 구독자가 없을 때 Pub/Sub 메시지가 유실되는 구간의 재전송 보장은 다음 단계입니다.",
    demo: "fanout",
  },
  {
    id: "gpu",
    area: "AI · 데이터",
    title: "자동전표 AI의 GPU 배치 평가 파이프라인",
    tagline: "가장 큰 모델을 운영에 붙이는 대신, 운영과 실험의 장애 도메인을 분리했습니다.",
    period: "2026.07 — 08",
    role: "설계 · 구현 · 운영",
    status: { kind: "integrated", label: "주 브랜치 통합" },
    stack: ["Python", "KT Cloud A100", "BGE-M3", "FAISS", "Qwen", "LoRA / QLoRA"],
    problem:
      "운영 중인 룰·모델 기반 자동전표 추천을 AI로 바로 대체하기엔 라벨 품질이 불명확했습니다. 사용자의 수정 기록이 어떤 추천을 고친 것인지 안정적으로 연결되지 않았고, GPU 세션은 휘발성이라 긴 추론이 중간에 끊길 수 있었습니다.",
    decisions: [
      "명시적 교정은 강한 라벨, 유지된 추천은 약한 라벨로 나누고 안정화 기간이 지난 건만 내보냈습니다. 약한 라벨로는 정확도를 계산하지 않습니다.",
      "CSV + manifest(체크섬·행 수) + 마지막에 올리는 ready 표식으로 전달 계약을 만들고, 같은 batch에 다른 체크섬이 오면 덮어쓰지 않고 거부합니다.",
      "스냅샷 N의 변경 행은 N-1 인덱스로만 평가해 정답 누수를 막고, 체크포인트·완료 키 skip으로 끊긴 추론을 이어 갑니다.",
    ],
    result:
      "GPU 세션이 종료돼도 운영 추천은 영향을 받지 않습니다. 온라인 RAG 연결은 실험 후 교차 클라우드 장애 전파 비용을 보고 제거했고, Qwen 7B는 LoRA/QLoRA로 학습, 32B는 Teacher 추론·평가에만 썼습니다.",
    limit:
      "평가 리포트가 인덱스 승격을 통계 기준으로 자동 차단하지는 않습니다. GPU 환경으로의 전달은 2FA 콘솔을 거치는 수동 절차입니다.",
    demo: "gpu",
  },
  {
    id: "https",
    area: "네트워크 · GitOps",
    title: "GCP → NCP 금융존 HTTPS 전환",
    tagline: "URL 한 줄이 아니라, DNS부터 Pod까지 일곱 계층을 바꾸는 일이었습니다.",
    period: "2026.08",
    role: "설계 · 수행 · 검증",
    status: { kind: "integrated", label: "운영 설정 반영" },
    stack: ["Cloud DNS", "ACME DNS-01", "NCP LB · NACL", "Kustomize", "Argo CD", "GKE"],
    problem:
      "GKE의 백엔드가 NCP 금융존의 스크래핑 엔진 두 대를 HTTP로 호출하고 있었습니다. URL만 바꿔서는 DNS 검증, 인증서, NACL, 로드밸런서 리스너, NAT 출발지, 런타임 설정이 함께 바뀌지 않습니다.",
    decisions: [
      "기존 HTTP 리스너·DNS·대상 그룹을 그대로 두고 HTTPS 경로를 추가만 했습니다. 롤백은 endpoint를 되돌리는 것으로 끝납니다.",
      "인증서 자동 갱신은 DNS 쓰기 권한 범위와 운영 복잡도를 보고 첫 전환 범위에서 분리했습니다.",
      "외부에서 endpoint를 검증한 뒤에도 끝내지 않고, production Pod 안에서 실제 호출을 확인했습니다.",
    ],
    result:
      "백엔드 코드 변경 없이 외부 통신 구간을 암호화했습니다. 애플리케이션 기본 설정보다 GitOps 환경변수가 우선해 Pod가 여전히 HTTP를 쓰던 문제를 Pod 내부 검증에서 찾아 함께 전환했습니다.",
    limit:
      "인증서 갱신은 아직 수동 절차와 만료 알림에 의존합니다. dev/prod 전환을 한 번에 묶었는데, 단계적 승격으로 나누는 편이 더 안전했습니다.",
    demo: "https",
  },
  {
    id: "chatbot",
    area: "AI 서비스 · 메시징",
    title: "비영업시간 고객 초동 대응 AI 상담",
    tagline: "AI는 답만 계산하고, 상태 판단과 발송은 기존 시스템이 책임집니다.",
    period: "2026.09 —",
    role: "개발 · 서비스 제공",
    status: { kind: "service", label: "실제 서비스 제공" },
    stack: ["Kotlin", "RabbitMQ", "Redis", "Python", "LLM", "멱등성"],
    problem:
      "영업시간 외 고객 문의에 초기 응대 공백이 있었고, 그 대화는 다음 날 담당자 업무로 자연스럽게 이어져야 했습니다. AI가 기존 상담 흐름을 덮어쓰거나 담당자와 동시에 답하면 안 됐습니다.",
    decisions: [
      "채팅 서버가 저장 완료 이벤트를 발행하고, 업무 백엔드가 고객·열린 일감·업무시간·담당자 활동을 판정합니다.",
      "Redis에 묶음 대기와 처리 잠금을 두고, 답변 서비스는 승인 FAQ·사업장 가이드·법령 근거로 답만 계산합니다.",
      "실제 저장·발송은 기존 채널 API가 맡고, AI 발화 식별자·멱등 request ID·담당자 선응대 확인으로 중복과 충돌을 줄였습니다.",
    ],
    result:
      "기존 채팅·고객 업무 시스템에 AI 응대를 연결해 실제 서비스를 제공했습니다. 상태 관리와 답변 계산의 책임을 나눠, 비용과 응답 품질을 평가하며 후속 개선을 이어 가고 있습니다.",
    limit:
      "응답 직전의 상태 확인과 메시지 조립 사이에 새 고객 메시지가 들어오는 경쟁 구간, 후속 메시지 실패의 독립 재처리는 남은 과제입니다.",
    demo: "chatbot",
  },
];

export const timeline = [
  { month: "2026.04", items: ["업무 이벤트 기반 알림 플랫폼 설계 시작"] },
  { month: "2026.05", items: ["Redis Pub/Sub로 다중 인스턴스 SSE 전달", "인증서 업로드·해지방어 현황 화면"] },
  { month: "2026.06", items: ["전자파일 생성 구조를 단계별 빌더로 재편", "업무 heartbeat watchdog + GitOps 온보딩"] },
  { month: "2026.07", items: ["CP949 → X-WINDOWS-949 문자셋 fallback, 다중 파일 암호화", "자동전표 V5 신뢰 라벨 + GPU 배치 평가 파이프라인", "레거시 리드 페이지 Next.js 이전"] },
  { month: "2026.08", items: ["GPU 온라인 RAG 경로 제거, 오프라인 평가로 축소", "홈페이지 챗봇 개발(승인 FAQ 폐쇄형 검색)", "NCP 금융존 HTTPS 전환"] },
  { month: "2026.09", items: ["채팅 WIKI 추천 연동(공동)", "세무대리인 이관 실행 컨텍스트·dry-run", "비영업시간 AI 상담 서비스 제공"] },
  { month: "2026.10", items: ["nginx 자체 health check 분리", "수임 이력 판정 정합성, 간이지급 제출 API 통합"] },
];

/** Non-merge, non-stash commits authored by me, grouped by month and area.
 *  Used only to show where work moved — not a productivity metric. */
export const workflowByMonth = [
  { month: "4월", backend: 6, frontend: 0, infra: 0, ai: 0 },
  { month: "5월", backend: 36, frontend: 25, infra: 7, ai: 0 },
  { month: "6월", backend: 37, frontend: 20, infra: 18, ai: 0 },
  { month: "7월", backend: 16, frontend: 15, infra: 21, ai: 18 },
  { month: "8월", backend: 9, frontend: 3, infra: 9, ai: 11 },
  { month: "9월", backend: 19, frontend: 23, infra: 10, ai: 0 },
  { month: "10월", backend: 7, frontend: 3, infra: 5, ai: 0 },
];

export const otherWork = [
  {
    title: "채팅 WIKI 추천 연동",
    tag: "공동 기여",
    body: "상담 채팅의 최근 문맥으로 사내 WIKI 후보를 추천하는 서비스의 초기 구조와 연계·통합을 맡았습니다. 형태소 분석·검색 고도화는 동료의 작업입니다.",
    size: "wide",
  },
  {
    title: "업무 heartbeat watchdog",
    tag: "통합",
    body: "프로세스 생존이 아니라 실제 업무 루프의 heartbeat를 감시합니다. 이전 타이머 콜백이 상태를 덮어쓰지 않도록 타이머 식별자를 비교하고, 단일 replica 제약을 명시했습니다.",
    size: "tall",
  },
  {
    title: "nginx 자체 health check",
    tag: "통합",
    body: "LB·liveness·readiness가 사이트 redirect나 upstream 상태에 묶이지 않도록 nginx 생존 판정을 분리했습니다.",
    size: "base",
  },
  {
    title: "홈페이지 챗봇",
    tag: "개발 경험",
    body: "LLM 자유 생성을 막고 승인 FAQ로 만든 catalog/vector만으로 답합니다. exact → 문자열 유사도 → 임베딩 순 검색, manifest 불일치 시 readiness 실패, same-origin BFF.",
    size: "base",
  },
  {
    title: "레거시 페이지 Next.js 이전",
    tag: "통합",
    body: "템플릿 기반 리드·수임동의 페이지를 모노레포로 옮기면서 기존 URL, 유입 파라미터, 전환 추적을 그대로 유지했습니다.",
    size: "base",
  },
  {
    title: "클라우드 비용 분석",
    tag: "분석",
    body: "GKE request 최적화와 실제 청구 절감을 구분하고, 약정 사용 할인의 커버리지·활용률과 갱신 시점을 함께 봤습니다.",
    size: "base",
  },
];

export type SideProject = {
  title: string;
  kind: string;
  summary: string;
  points: string[];
  stack: string[];
  troubles: { title: string; cause: string; fix: string }[];
};

export const sideProjects: SideProject[] = [
  {
    title: "팬텀 토큰 · Redis Write-Back 게시판",
    kind: "개인 프로젝트",
    summary: "클라이언트에는 의미 없는 UUID만 주고, 서버가 Redis에서 내부 JWT로 바꿔 인증합니다. 즉시 무효화와 정보 비노출을 함께 얻는 구조입니다.",
    points: [
      "UUID ↔ JWT 매핑을 Redis에 두고 HttpOnly 쿠키로 전달, 파싱 실패 시 오염 키 즉시 파기",
      "조회수는 Redis INCR로 누적하고 5분마다 벌크 반영, GETDEL로 읽기-삭제 원자화",
      "최근 검색어는 ZSET score=시간으로 중복 제거·정렬·슬라이딩 한도 관리",
    ],
    stack: ["Spring Boot 4", "Java 21", "Redis", "MySQL", "Flyway", "S3", "GitHub Actions · ECR · SSM"],
    troubles: [
      {
        title: "Write-Back 조회수 불일치",
        cause: "Redis 누적값과 DB 값이 분리돼 화면 표시값이 어긋나고, 스케줄러가 읽고 지우는 사이 증가분이 유실될 수 있었습니다.",
        fix: "GETDEL로 원자 처리하고, 상세 조회 시 DB 값에 미반영 누적값을 합산해 응답했습니다.",
      },
      {
        title: "다중 소셜 계정 식별 충돌",
        cause: "인증 주체를 이메일로 식별해, 서로 다른 OAuth 제공자의 같은 이메일이 권한을 공유했습니다.",
        fix: "(provider, providerId) 복합 기준으로 조회하고 내부 식별자를 DB PK로 바꿨습니다.",
      },
      {
        title: "DB 트랜잭션과 S3 정합성",
        cause: "DB 롤백과 S3 업로드·삭제 시점이 동기화되지 않았습니다.",
        fix: "업로드는 롤백 시 파일 삭제, 게시글 삭제는 커밋 후 파일 삭제로 후처리 수명주기를 나눴습니다.",
      },
    ],
  },
  {
    title: "Spring AI RAG 코어 모듈",
    kind: "개인 프로젝트",
    summary: "PDF를 업로드하면 커밋 이후 비동기 ETL로 파싱·청킹·임베딩·벡터 적재를 하고, 사용자 소유 문서로만 검색해 근거와 함께 답합니다.",
    points: [
      "@TransactionalEventListener(AFTER_COMMIT) + 전용 스레드풀로 업로드 응답과 무거운 ETL 분리",
      "Qdrant 메타데이터 필터로 사용자별 문서 격리(멀티 테넌시)",
      "Advisor 패턴으로 대화 메모리 연결, 근거 없음 시 일반 대화로 fallback",
    ],
    stack: ["Spring Boot 4", "Spring AI 2", "Java 21", "Qdrant", "Redis", "S3", "MySQL"],
    troubles: [
      {
        title: "동기 ETL의 네트워크 타임아웃",
        cause: "수십 초 걸리는 임베딩·S3 통신이 HTTP 요청 스레드와 단일 트랜잭션에 묶여 있었습니다.",
        fix: "커밋 이후 비동기로 분리하고 단계별 상태를 남겨, S3 원본과 DB 상태로 언제든 재처리할 수 있게 했습니다.",
      },
      {
        title: "Qdrant 숫자 메타데이터 필터 실패",
        cause: "숫자형 메타데이터의 타입 해석 차이(1 vs \"1\")로 일치 문서를 찾지 못했습니다.",
        fix: "문자열 필드를 함께 저장하고 검색 필터를 문자열 기준으로 바꿨습니다.",
      },
    ],
  },
  {
    title: "Tuddy — 학습형 RAG 챗봇",
    kind: "팀 프로젝트 · 3인 · 백엔드",
    summary: "업로드한 학습 자료 안에서만 답하는 공부 전용 챗봇. Spring은 인증·파일·세션과 AI 서버 호출을 중계하는 오케스트레이터입니다.",
    points: [
      "Presigned URL로 S3 직접 업로드, 서버는 URL 발급·메타데이터·권한만 담당",
      "첨부·세션 내 파일 이력으로 일반 챗과 RAG 챗을 동적 라우팅",
      "GitHub Actions + OIDC → ECR → SSM으로 EC2 배포와 헬스체크",
    ],
    stack: ["Spring Boot 3.5", "Java 21", "FastAPI", "Pinecone", "S3 · RDS", "Gemini 2.5 Flash"],
    troubles: [
      {
        title: "업로드 경로 이원화",
        cause: "드래그앤드롭 UX를 위해 서버 직접 업로드가 제안돼 두 경로가 공존했습니다.",
        fix: "UX는 유지하되 전송은 Presigned URL로 통일해 서버가 파일 본문을 중계하지 않게 했습니다.",
      },
      {
        title: "세션 → JWT 전환",
        cause: "모바일·외부 클라이언트 확장 시 세션 기반 인증의 한계가 보였습니다.",
        fix: "stateless JWT 구조로 바꿔 세션 저장소 의존을 제거했습니다.",
      },
    ],
  },
];

export const stack = [
  { group: "백엔드", items: ["Kotlin", "Java 21", "Spring Boot", "JPA · QueryDSL", "Spring AI", "Redis", "RabbitMQ", "MySQL", "Flyway"] },
  { group: "인프라 · 배포", items: ["Docker", "Kubernetes · GKE", "Kustomize", "Argo CD", "Terraform", "GitHub Actions", "AWS EC2 · ECR · S3 · SSM", "NCP", "nginx"] },
  { group: "AI · 데이터", items: ["Python", "FastAPI", "RAG", "Qdrant · Pinecone · FAISS", "BGE-M3", "Qwen LoRA / QLoRA", "Vertex AI"] },
  { group: "프론트엔드", items: ["React", "Next.js", "TypeScript", "Turborepo"] },
];

export const education = [
  { label: "성공회대학교 소프트웨어공학전공 졸업", meta: "2020.03 — 2026.02 · 학점 4.05 / 4.5" },
  { label: "정보처리기사", meta: "2025.03" },
  { label: "SQLD", meta: "2024.12" },
];

export const credits = [
  { name: "Motion", use: "시트 전환 · 카드 스택 · 글자 리빌 · 오버레이", license: "MIT", url: "https://motion.dev" },
  { name: "anime.js v4", use: "마지막 제목 글자 분할 · 중앙에서 퍼지는 스태거", license: "MIT", url: "https://animejs.com" },
  { name: "Bklit UI", use: "막대 · 링 차트(소스 복사, src/vendor/bklit)", license: "MIT", url: "https://ui.bklit.com" },
  { name: "lucide-react", use: "아이콘", license: "ISC", url: "https://lucide.dev" },
  { name: "visx · d3", use: "Bklit UI 차트의 스케일·도형", license: "MIT · ISC", url: "https://airbnb.io/visx" },
  { name: "Kanit · Pretendard", use: "영문 · 한글 서체", license: "SIL OFL 1.1", url: "https://fonts.google.com/specimen/Kanit" },
  { name: "포트폴리오 레이아웃 브리프 (motionsites.ai)", use: "레이아웃·연출 구조, 히어로 배경 영상", license: "MotionSites 이용약관", url: "https://motionsites.ai/terms" },
  { name: "Emil Kowalski skills · Taste skill", use: "애니메이션·레이아웃 원칙 참고(코드 미포함)", license: "MIT", url: "https://github.com/emilkowalski/skill" },
  { name: "Impeccable", use: "디자인 품질 기준 참고(코드 미포함)", license: "Apache-2.0", url: "https://github.com/pbakaus/impeccable" },
];
