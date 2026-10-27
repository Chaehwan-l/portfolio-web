import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export type Variant = {
  key: string;
  title: string;
  brief: string;
  theme: { bg: string; fg: string };
  Component: LazyExoticComponent<ComponentType>;
};

/** Each design draft lives at /<key>/. Add a new entry to try the next idea. */
export const variants: Variant[] = [
  {
    key: "a",
    title: "시트 & 스택",
    brief: "Kanit · 회청색 그라데이션 · 흰/검정 시트가 덮어 올라오는 전환 · 카드 스택",
    theme: { bg: "#0C0C0C", fg: "#D7E2EA" },
    Component: lazy(() => import("./a/App")),
  },
  {
    key: "b",
    title: "리퀴드 글래스",
    brief: "Instrument Serif + Barlow · 리퀴드 글래스 · 페이드 루프 영상 · 단어 블러 인",
    theme: { bg: "#000000", fg: "#FFFFFF" },
    Component: lazy(() => import("./b/App")),
  },
  {
    key: "c",
    title: "인사이드 아웃",
    brief: "Space Grotesk · VEYRA 인터랙티브 카 · 엔진/배터리/도장/휠 = 백엔드 은유",
    theme: { bg: "#6b879d", fg: "#ffffff" },
    Component: lazy(() => import("./c/App")),
  },
  {
    key: "d",
    title: "다크 에디토리얼",
    brief: "Inter + Instrument Serif · 로딩 카운터 · HLS 히어로 · 벤토 사례 · 핀 고정 패럴랙스 갤러리 · GSAP 마키",
    theme: { bg: "#0a0a0a", fg: "#f5f5f5" },
    Component: lazy(() => import("./d/App")),
  },
  {
    key: "e",
    title: "B + D 통합",
    brief: "D의 뼈대(벤토 · 고정 패럴랙스 · 마키) + B의 메시지 · 근거 카드 · 역량 · 기록 차트 · 로딩은 세션당 한 번",
    theme: { bg: "#0a0a0a", fg: "#f5f5f5" },
    Component: lazy(() => import("./e/App")),
  },
];
