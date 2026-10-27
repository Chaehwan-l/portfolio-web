// Generated from scripts/capture-marquee.mjs — screenshots of this site's own interactive panels.
export const marqueeTiles: { src: string; label: string }[] = [
  { src: "/marquee/agency-event.webp", label: "수임 상태 · 사건 단위 선택" },
  { src: "/marquee/pipeline-charset.webp", label: "전자신고 · 문자셋 fallback" },
  { src: "/marquee/fanout-redis.webp", label: "알림 전달 · Redis Pub/Sub" },
  { src: "/marquee/gpu-leak.webp", label: "GPU 평가 · 정답 누수 점검" },
  { src: "/marquee/https-found.webp", label: "HTTPS 전환 · Pod 내부 확인" },
  { src: "/marquee/chat-normal.webp", label: "비영업시간 AI · 처리 흐름" },
  { src: "/marquee/flow-chart.webp", label: "월별 작업 영역" },
  { src: "/marquee/gpu-checkpoint.webp", label: "GPU 평가 · 체크포인트 재개" },
  { src: "/marquee/https-fixed.webp", label: "HTTPS 전환 · 수정 완료" },
  { src: "/marquee/chat-staff.webp", label: "비영업시간 AI · 담당자 선응대" },
  { src: "/marquee/agency-field.webp", label: "수임 상태 · 필드별 최댓값의 함정" },
  { src: "/marquee/pipeline-partial.webp", label: "전자신고 · 부분 실패" },
  { src: "/marquee/fanout-memory.webp", label: "알림 전달 · 인스턴스 메모리만" },
  { src: "/marquee/gpu-snapshot.webp", label: "GPU 평가 · N-1 인덱스" },
  { src: "/marquee/chat-dup.webp", label: "비영업시간 AI · 멱등성" },
];

export const casePreview: Partial<Record<"agency" | "pipeline" | "fanout" | "gpu" | "https" | "chatbot", string>> = {
  agency: "/marquee/agency-event.webp",
  pipeline: "/marquee/pipeline-charset.webp",
  fanout: "/marquee/fanout-redis.webp",
  gpu: "/marquee/gpu-leak.webp",
  https: "/marquee/https-found.webp",
  chatbot: "/marquee/chat-normal.webp",
};
