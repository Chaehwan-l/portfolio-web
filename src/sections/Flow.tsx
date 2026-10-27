import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { timeline, workflowByMonth } from "@/data/content";
import { BigHeading, FadeIn, Sheet } from "@/components/ui";
import { Bar, BarChart, BarXAxis, ChartTooltip, Grid } from "@/vendor/bklit/charts";

const SERIES = [
  { key: "backend", label: "백엔드", color: "#D7E2EA" },
  { key: "frontend", label: "프론트엔드", color: "#5b5f68" },
  { key: "infra", label: "인프라 · GitOps", color: "#B600A8" },
  { key: "ai", label: "AI · 데이터", color: "#BE4C00" },
] as const;

const totals = SERIES.map((s) => ({ ...s, total: workflowByMonth.reduce((a, m) => a + (m[s.key] as number), 0) }));
const grand = totals.reduce((a, t) => a + t.total, 0);

export function Flow() {
  return (
    <Sheet id="flow" tone="light" z={40}>
      <div className="px-5 py-20 sm:px-8 sm:py-24 md:px-10 md:py-32">
        <BigHeading tone="light">작업 흐름</BigHeading>
        <FadeIn y={20} delay={0.1}>
          <p className="mx-auto mt-8 max-w-[620px] text-center text-[15px] leading-relaxed text-[#0C0C0C]/65 md:text-[17px]">
            백엔드에서 시작해, 코드가 도착하는 곳까지. 월별로 어떤 영역을 다뤘는지 보여 주는 지도입니다. 커밋 수는 생산성 지표가 아니라 작업이 어디로 이동했는지 읽는 용도로만 씁니다.
          </p>
        </FadeIn>

        <FadeIn y={40} className="mx-auto mt-14 max-w-[1240px] md:mt-20">
          <div className="rounded-[40px] bg-[#0C0C0C] p-5 text-[#D7E2EA] sm:rounded-[50px] sm:p-8 md:rounded-[60px] md:p-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="text-[13px] font-medium tracking-[0.1em]">월별 작업 영역</div>
                <div className="mt-1 text-[12px] text-[#D7E2EA]/55">2026.04 — 10 · 본인 작성 · 병합·임시 커밋 제외 · 18개 저장소</div>
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {totals.map((t) => (
                  <li key={t.key} className="flex items-center gap-2 text-[12px]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} />
                    <span className="uppercase tracking-wider">{t.label}</span>
                    <span className="text-[#D7E2EA]/55 tabular">{Math.round((t.total / grand) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="h-[300px] sm:h-[380px]">
              <BarChart data={workflowByMonth} xDataKey="month" stacked stackGap={3} aspectRatio="auto" className="h-full">
                <Grid horizontal />
                {SERIES.map((s) => (
                  <Bar key={s.key} dataKey={s.key} fill={s.color} lineCap={8} stackGap={3} />
                ))}
                <BarXAxis />
                <ChartTooltip rows={(p) => SERIES.filter((s) => (p[s.key] as number) > 0).map((s) => ({ color: s.color, label: s.label, value: p[s.key] as number }))} />
              </BarChart>
            </div>
            <div className="mt-8 grid gap-4 border-t border-[#D7E2EA]/10 pt-6 text-[13.5px] leading-relaxed text-[#D7E2EA]/65 sm:grid-cols-3">
              <p>
                <span className="font-medium text-[#D7E2EA]">4–6월 </span>알림·전자신고 백엔드가 중심, 화면을 함께 붙였습니다.
              </p>
              <p>
                <span className="font-medium text-[#D7E2EA]">7–8월 </span>인프라와 AI 비중이 커집니다. GitOps 온보딩, GPU 배치 평가, HTTPS 전환.
              </p>
              <p>
                <span className="font-medium text-[#D7E2EA]">9–10월 </span>다시 도메인으로. 대리인 전환·AI 상담 서비스·제출 API.
              </p>
            </div>
          </div>
        </FadeIn>

        <Timeline />
      </div>
    </Sheet>
  );
}

function Timeline() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.55"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <div className="mx-auto mt-24 max-w-5xl md:mt-32">
      <ol ref={ref} className="relative">
        <span className="absolute bottom-0 left-[calc(clamp(3rem,10vw,140px)*0.5)] top-0 hidden w-px bg-[#0C0C0C]/10 md:block" />
        <motion.span
          className="absolute bottom-0 left-[calc(clamp(3rem,10vw,140px)*0.5)] top-0 hidden w-[2px] origin-top md:block"
          style={{ scaleY, background: "linear-gradient(180deg,#B600A8,#7621B0,#BE4C00)" }}
        />
        {timeline.map((t, i) => (
          <FadeIn key={t.month} as="li" delay={0.05} className="grid grid-cols-[auto_1fr] gap-6 border-b border-[rgba(12,12,12,0.15)] py-8 first:border-t sm:gap-10 md:py-10">
            <span className="relative z-10 shrink-0 whitespace-nowrap bg-white pr-2 font-black leading-none text-[#0C0C0C]" style={{ fontSize: "clamp(2.2rem, 6vw, 84px)" }}>
              {String(i + 4).padStart(2, "0")}
            </span>
            <div className="pt-1">
              <div className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#0C0C0C]/50">{t.month}</div>
              <ul className="mt-2 space-y-1.5">
                {t.items.map((it) => (
                  <li key={it} className="font-light leading-relaxed text-[#0C0C0C]" style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.2rem)" }}>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        ))}
      </ol>
    </div>
  );
}
