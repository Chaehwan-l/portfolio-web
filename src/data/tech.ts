/* ------------------------------------------------------------------
   Technology-first copy for variants B, D, E.
   Same cases and facts as content.ts, with the company name and the
   tax/accounting domain removed so the page reads as backend craft.
   Variants A and C still use content.ts.
------------------------------------------------------------------- */
import { cases as baseCases, profile as baseProfile, type CaseStudy } from "./content";

export const techProfile = {
  name: baseProfile.name,
  nameEn: baseProfile.nameEn,
  role: "백엔드 엔지니어",
  email: baseProfile.email,
  github: baseProfile.github,
  githubLabel: baseProfile.githubLabel,
  since: "2026.04 —",
  intro:
    "Kotlin·Spring으로 백엔드를 만듭니다. 늦고, 틀리고, 중간에 끊기는 외부 연동을 단계와 상태로 나누고, 그 코드가 GitOps·Kubernetes·네트워크를 지나 실제로 동작하는 곳까지 책임집니다.",
  headline: "구현을 넘어, 배포와 운영 구조까지 설계하는 백엔드 개발자",
};

type Copy = Pick<CaseStudy, "area" | "title" | "tagline" | "stack" | "problem" | "decisions" | "result" | "limit">;

const COPY: Record<string, Copy> = {
  agency: {
    area: "도메인 모델링 · 외부 연동",
    title: "실행 컨텍스트 분리와 이력 판정 정합성",
    tagline: "외부 응답을 필드별 ‘최신값’으로 합치지 않고, 한 건의 일관성을 지켰습니다.",
    stack: ["Kotlin", "Spring Boot", "외부 API 연동", "Feature flag", "Kustomize"],
    problem:
      "‘누구의 자격으로 외부 API를 호출하는가’를 정하는 규칙이 수십 개 호출 경로에 흩어져 있어, 실행 주체가 바뀌면 모든 경로를 한꺼번에 고쳐야 했습니다. 외부 시스템은 같은 대상의 신청·동의·철회 이력을 여러 행으로 돌려주고, 대상 유형마다 식별자 형태도 달랐습니다.",
    decisions: [
      "조회 식별자와 실행 주체 ID를 분리하고, 실행 컨텍스트와 resolver로 결정 규칙을 한 곳에 모았습니다.",
      "코드 배포와 동작 전환을 분리했습니다. GitOps 설정의 feature flag, 기존 경로 fallback, 실제 변경 전 dry-run 리포트를 두었습니다.",
      "복수 이력은 날짜 필드별 최댓값을 합치지 않고, 유효한 건을 우선해 ‘실제 한 건’을 고른 뒤 그 행의 값을 함께 쓰도록 바꿨습니다.",
    ],
    result:
      "결정 규칙이 호출부마다 흩어지지 않게 됐고, 단계적 전환과 롤백이 설정 변경만으로 가능해졌습니다. 서로 다른 건의 날짜가 섞여 존재하지 않는 상태가 만들어지는 판정 오류를 막았습니다.",
    limit:
      "첫 공통화 변경이 134개 파일에 걸칠 만큼 영향 반경이 컸습니다. 공통화의 결과이면서 기존 결합도의 증거였고, 이후에는 더 작은 단계로 나눠 진행하는 편이 낫다는 교훈을 얻었습니다.",
  },
  pipeline: {
    area: "배치 · 파일 처리",
    title: "고정 길이 파일 생성·제출 배치 파이프라인",
    tagline: "유형별로 복제되던 생성 코드를 단계별 책임과 공통 오케스트레이션으로 바꿨습니다.",
    stack: ["Kotlin", "Strategy / Builder", "Batch", "RabbitMQ", "Charset"],
    problem:
      "여러 유형의 고정 길이 레코드 파일은 흐름은 같지만 규격이 달랐습니다. 대상 선정·조립·인코딩·암호화·제출이 유형별 코드에 반복됐고, CP949로 표현할 수 없는 문자 하나가 batch 전체를 실패시킬 수 있었습니다.",
    decisions: [
      "대상 선정 → 레코드 빌더 → 조립 → 문자셋 → 암호화 → 제출 → 검증으로 단계를 나누고, 상위 orchestrator가 batch 단위로 묶게 했습니다.",
      "인코딩 판단을 별도 resolver로 분리했습니다. CP949로 표현할 수 없으면 X-WINDOWS-949로 전환하는 정책을 모든 유형이 공유합니다.",
      "실제 화면 호출 경로를 외부 생성 API 기반의 공통 마감·제출 흐름에 연결하고, 작업자별 큐 순서를 분산했습니다.",
    ],
    result:
      "새 파일 유형은 빌더와 매퍼만 추가하면 됩니다. 인코딩·암호화 실패가 도메인 흐름 밖으로 격리됐고, 항목별 결과가 남아 부분 실패를 구체적으로 돌려줄 수 있습니다.",
    limit:
      "파일 처리 도메인이 큰 모듈과 배포 단위를 공유합니다. 외부 단계가 많은 만큼 workflow 상태 영속화와 보상 전략을 더 명시할 여지가 있습니다.",
  },
  fanout: {
    area: "비동기 · 실시간",
    title: "다중 인스턴스 실시간 알림 플랫폼",
    tagline: "사용자가 어느 서버에 연결돼 있든, 알림은 도착해야 합니다.",
    stack: ["Spring", "Redis Pub/Sub", "SSE", "FCM", "Cursor pagination"],
    problem:
      "배치 작업 완료, 음성 인식(STT), 채팅 지연 등 여러 기능이 알림을 만들었지만 이벤트 원인과 표시 문구가 결합돼 있었습니다. 서버가 여러 대가 되면 SSE 연결이 붙은 인스턴스에서만 알림이 전달될 수 있었습니다.",
    decisions: [
      "이벤트를 먼저 영속화하고, 표시 템플릿과 전달 채널을 분리했습니다.",
      "인스턴스 간 전달 경계로 Redis Pub/Sub를 두고, FCM과 SSE가 같은 이벤트 모델을 공유하게 했습니다.",
      "목록은 DB 기준으로 조회하고 SSE는 ‘새 알림이 있다’는 신호로만 썼습니다.",
    ],
    result:
      "새 알림은 이벤트와 템플릿만 확장하면 됩니다. 연결 위치와 무관하게 전달되고, 발생·저장·전달·표시의 실패 지점을 따로 추적할 수 있습니다.",
    limit:
      "이벤트 저장과 외부 전달의 원자성(outbox)과, 구독자가 없을 때 Pub/Sub 메시지가 유실되는 구간의 재전송 보장은 다음 단계입니다.",
  },
  gpu: {
    area: "AI · 데이터",
    title: "추천 모델의 GPU 배치 평가 파이프라인",
    tagline: "가장 큰 모델을 운영에 붙이는 대신, 운영과 실험의 장애 도메인을 분리했습니다.",
    stack: ["Python", "A100", "BGE-M3", "FAISS", "Qwen", "LoRA / QLoRA"],
    problem:
      "운영 중인 룰·모델 기반 분류 추천을 AI로 바로 대체하기엔 라벨 품질이 불명확했습니다. 사용자의 수정 기록이 어떤 추천을 고친 것인지 안정적으로 연결되지 않았고, GPU 세션은 휘발성이라 긴 추론이 중간에 끊길 수 있었습니다.",
    decisions: [
      "명시적 교정은 강한 라벨, 유지된 추천은 약한 라벨로 나누고 안정화 기간이 지난 건만 내보냈습니다. 약한 라벨로는 정확도를 계산하지 않습니다.",
      "CSV + manifest(체크섬·행 수) + 마지막에 올리는 ready 표식으로 전달 계약을 만들고, 같은 batch에 다른 체크섬이 오면 덮어쓰지 않고 거부합니다.",
      "스냅샷 N의 변경 행은 N-1 인덱스로만 평가해 정답 누수를 막고, 체크포인트·완료 키 skip으로 끊긴 추론을 이어 갑니다.",
    ],
    result:
      "GPU 세션이 종료돼도 운영 추천은 영향을 받지 않습니다. 온라인 RAG 연결은 실험 후 교차 클라우드 장애 전파 비용을 보고 제거했고, Qwen 7B는 LoRA/QLoRA로 학습, 32B는 Teacher 추론·평가에만 썼습니다.",
    limit:
      "평가 리포트가 인덱스 승격을 통계 기준으로 자동 차단하지는 않습니다. GPU 환경으로의 전달은 2FA 콘솔을 거치는 수동 절차입니다.",
  },
  https: {
    area: "네트워크 · GitOps",
    title: "클라우드 간 HTTPS 전환 (GKE → NCP)",
    tagline: "URL 한 줄이 아니라, DNS부터 Pod까지 일곱 계층을 바꾸는 일이었습니다.",
    stack: ["Cloud DNS", "ACME DNS-01", "NCP LB · NACL", "Kustomize", "Argo CD", "GKE"],
    problem:
      "GKE의 백엔드가 다른 클라우드(NCP 폐쇄망 구역)의 외부 연동 엔진 두 대를 HTTP로 호출하고 있었습니다. URL만 바꿔서는 DNS 검증, 인증서, NACL, 로드밸런서 리스너, NAT 출발지, 런타임 설정이 함께 바뀌지 않습니다.",
    decisions: [
      "기존 HTTP 리스너·DNS·대상 그룹을 그대로 두고 HTTPS 경로를 추가만 했습니다. 롤백은 endpoint를 되돌리는 것으로 끝납니다.",
      "인증서 자동 갱신은 DNS 쓰기 권한 범위와 운영 복잡도를 보고 첫 전환 범위에서 분리했습니다.",
      "외부에서 endpoint를 검증한 뒤에도 끝내지 않고, production Pod 안에서 실제 호출을 확인했습니다.",
    ],
    result:
      "백엔드 코드 변경 없이 클라우드 간 통신 구간을 암호화했습니다. 애플리케이션 기본 설정보다 GitOps 환경변수가 우선해 Pod가 여전히 HTTP를 쓰던 문제를 Pod 내부 검증에서 찾아 함께 전환했습니다.",
    limit:
      "인증서 갱신은 아직 수동 절차와 만료 알림에 의존합니다. dev/prod 전환을 한 번에 묶었는데, 단계적 승격으로 나누는 편이 더 안전했습니다.",
  },
  chatbot: {
    area: "AI 서비스 · 메시징",
    title: "영업시간 외 AI 초동 응대 시스템",
    tagline: "AI는 답만 계산하고, 상태 판단과 발송은 기존 시스템이 책임집니다.",
    stack: ["Kotlin", "RabbitMQ", "Redis", "Python", "LLM", "멱등성"],
    problem:
      "영업시간 외 사용자 문의에 초기 응대 공백이 있었고, 그 대화는 다음 날 담당자 업무로 자연스럽게 이어져야 했습니다. AI가 기존 대화 흐름을 덮어쓰거나 담당자와 동시에 답하면 안 됐습니다.",
    decisions: [
      "채팅 서버가 저장 완료 이벤트를 발행하고, 업무 백엔드가 사용자·열린 작업·업무시간·담당자 활동을 판정합니다.",
      "Redis에 묶음 대기와 처리 잠금을 두고, 답변 서비스는 승인 FAQ·운영 가이드·정책 문서 근거로 답만 계산합니다.",
      "실제 저장·발송은 기존 채널 API가 맡고, AI 발화 식별자·멱등 request ID·담당자 선응대 확인으로 중복과 충돌을 줄였습니다.",
    ],
    result:
      "기존 채팅·업무 시스템에 AI 응대를 연결해 실제 서비스로 운영하고 있습니다. 상태 관리와 답변 계산의 책임을 나눠, 비용과 응답 품질을 평가하며 후속 개선을 이어 가고 있습니다.",
    limit:
      "응답 직전의 상태 확인과 메시지 조립 사이에 새 사용자 메시지가 들어오는 경쟁 구간, 후속 메시지 실패의 독립 재처리는 남은 과제입니다.",
  },
};

export const techCases: CaseStudy[] = baseCases.map((c) => ({
  ...c,
  ...COPY[c.id],
  status: c.status.kind === "service" ? { kind: "service", label: "실제 서비스 운영" } : c.status,
}));

export const techTimeline = [
  { month: "2026.04", items: ["이벤트 기반 알림 플랫폼 설계 시작"] },
  { month: "2026.05", items: ["Redis Pub/Sub로 다중 인스턴스 SSE 전달", "인증서 업로드 · 상태 현황 화면"] },
  { month: "2026.06", items: ["파일 생성 구조를 단계별 빌더로 재편", "작업 heartbeat watchdog + GitOps 온보딩"] },
  { month: "2026.07", items: ["CP949 → X-WINDOWS-949 문자셋 fallback, 다중 파일 암호화", "추천 모델 신뢰 라벨 + GPU 배치 평가 파이프라인", "레거시 페이지 Next.js 이전"] },
  { month: "2026.08", items: ["GPU 온라인 RAG 경로 제거, 오프라인 평가로 축소", "웹 챗봇 개발(승인 FAQ 폐쇄형 검색)", "클라우드 간 HTTPS 전환"] },
  { month: "2026.09", items: ["채팅 WIKI 추천 연동(공동)", "실행 컨텍스트 분리 · dry-run 전환", "영업시간 외 AI 응대 서비스 운영"] },
  { month: "2026.10", items: ["nginx 자체 health check 분리", "이력 판정 정합성, 파일 제출 API 통합"] },
];

export const techOtherWork = [
  { title: "채팅 WIKI 추천 연동", tag: "공동 기여", body: "채팅의 최근 문맥으로 사내 WIKI 후보를 추천하는 서비스의 초기 구조와 연계·통합을 맡았습니다. 형태소 분석·검색 고도화는 동료의 작업입니다.", size: "wide" },
  { title: "작업 heartbeat watchdog", tag: "통합", body: "프로세스 생존이 아니라 실제 작업 루프의 heartbeat를 감시합니다. 이전 타이머 콜백이 상태를 덮어쓰지 않도록 타이머 식별자를 비교하고, 단일 replica 제약을 명시했습니다.", size: "tall" },
  { title: "nginx 자체 health check", tag: "통합", body: "LB·liveness·readiness가 사이트 redirect나 upstream 상태에 묶이지 않도록 nginx 생존 판정을 분리했습니다.", size: "base" },
  { title: "웹 챗봇", tag: "개발 경험", body: "LLM 자유 생성을 막고 승인 FAQ로 만든 catalog/vector만으로 답합니다. exact → 문자열 유사도 → 임베딩 순 검색, manifest 불일치 시 readiness 실패, same-origin BFF.", size: "base" },
  { title: "레거시 페이지 Next.js 이전", tag: "통합", body: "템플릿 기반 유입·동의 페이지를 모노레포로 옮기면서 기존 URL, 유입 파라미터, 전환 추적을 그대로 유지했습니다.", size: "base" },
  { title: "클라우드 비용 분석", tag: "분석", body: "GKE request 최적화와 실제 청구 절감을 구분하고, 약정 사용 할인의 커버리지·활용률과 갱신 시점을 함께 봤습니다.", size: "base" },
];

/** Previews captured from the neutral demo panels (scripts/capture-tech.mjs). */
export const techPreview: Record<CaseStudy["demo"], string> = {
  agency: "/marquee-tech/agency-event.webp",
  pipeline: "/marquee-tech/pipeline-charset.webp",
  fanout: "/marquee-tech/fanout-redis.webp",
  gpu: "/marquee-tech/gpu-leak.webp",
  https: "/marquee-tech/https-found.webp",
  chatbot: "/marquee-tech/chat-normal.webp",
};

export const techGallery = [
  { src: "/marquee-tech/gpu-checkpoint.webp", label: "GPU 평가 · 체크포인트 재개" },
  { src: "/marquee-tech/https-fixed.webp", label: "HTTPS 전환 · 수정 완료" },
  { src: "/marquee-tech/chat-staff.webp", label: "AI 응대 · 담당자 선응대" },
  { src: "/marquee-tech/agency-field.webp", label: "이력 판정 · 필드별 최댓값의 함정" },
  { src: "/marquee-tech/pipeline-partial.webp", label: "파일 배치 · 부분 실패" },
  { src: "/marquee-tech/fanout-memory.webp", label: "알림 전달 · 인스턴스 메모리만" },
];
