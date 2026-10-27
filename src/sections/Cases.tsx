import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import { cases, profile, type CaseStudy } from "@/data/content";
import { casePreview } from "@/data/marquee";
import { BigHeading, FadeIn, GhostButton, Sheet, StatusChip, Tag, EASE_OUT } from "@/components/ui";
import { AgencyDemo } from "@/demos/AgencyDemo";
import { PipelineDemo } from "@/demos/PipelineDemo";
import { FanoutDemo } from "@/demos/FanoutDemo";
import { GpuDemo } from "@/demos/GpuDemo";
import { HttpsDemo } from "@/demos/HttpsDemo";
import { ChatbotDemo } from "@/demos/ChatbotDemo";

export const DEMOS: Record<CaseStudy["demo"], () => React.ReactElement> = {
  agency: AgencyDemo,
  pipeline: PipelineDemo,
  fanout: FanoutDemo,
  gpu: GpuDemo,
  https: HttpsDemo,
  chatbot: ChatbotDemo,
};

/* ---------------------------------------------------------- Stacking cards */
/** Sticky cards that scale down as later cards slide over them. */
export function StackingCards<T>({ items, render }: { items: T[]; render: (item: T, i: number) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <div ref={ref} className="relative">
      {items.map((item, i) => (
        <StackCard key={i} i={i} total={items.length} progress={scrollYProgress}>
          {render(item, i)}
        </StackCard>
      ))}
    </div>
  );
}

function StackCard({ i, total, progress, children }: { i: number; total: number; progress: MotionValue<number>; children: ReactNode }) {
  const targetScale = 1 - (total - 1 - i) * 0.03;
  const scale = useTransform(progress, [i / total, 1], [1, targetScale]);
  const dim = useTransform(progress, [i / total, Math.min(1, (i + 1) / total)], [0, i === total - 1 ? 0 : 0.35]);
  return (
    <div className="flex h-[85vh] items-start justify-center">
      <motion.div
        style={{ scale, top: `calc(var(--stack-top) + ${i * 28}px)`, transformOrigin: "50% 0%" }}
        className="sticky w-full [--stack-top:6rem] md:[--stack-top:8rem]"
      >
        <div className="relative overflow-hidden rounded-[40px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:rounded-[50px] sm:p-6 md:rounded-[60px] md:p-8">
          {children}
          <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-[#0C0C0C]" />
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------- Cases */
export function Cases() {
  const [open, setOpen] = useState<CaseStudy | null>(null);

  return (
    <Sheet id="cases" z={30}>
      <div className="px-5 pb-[10vh] pt-20 sm:px-8 sm:pt-24 md:px-10 md:pt-32">
        <BigHeading>대표 사례</BigHeading>
        <FadeIn y={20} delay={0.1}>
          <p className="mx-auto mt-8 max-w-[640px] text-center text-[15px] leading-relaxed text-[#D7E2EA]/70 md:text-[17px]">
            {profile.company} · {profile.companyDesc} · 백엔드 · {profile.period}
            <br />
            실패 조건이 많은 업무를 구조로 바꾼 여섯 가지 사례. 카드를 열면 직접 조작해 볼 수 있습니다.
          </p>
        </FadeIn>

        <div className="mx-auto mt-16 max-w-[1240px] md:mt-24">
          <StackingCards items={cases} render={(c, i) => <CaseCard c={c} i={i} onOpen={() => setOpen(c)} />} />
        </div>
      </div>

      <CaseOverlay c={open} onClose={() => setOpen(null)} />
    </Sheet>
  );
}

function BigNum({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span className={`shrink-0 whitespace-nowrap font-black leading-none ${className}`} style={{ fontSize: "clamp(3rem, 8vw, 120px)" }}>
      0{n}
    </span>
  );
}

function CaseCard({ c, i, onOpen }: { c: CaseStudy; i: number; onOpen: () => void }) {
  const img = casePreview[c.demo];
  return (
    <div className="flex flex-col gap-5 md:gap-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-4 md:gap-6">
          <BigNum n={i + 1} className="hero-heading" />
          <div className="pb-1 md:pb-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#D7E2EA]/55 md:text-[13px]">{c.area}</div>
            <h3 className="mt-1 text-[19px] font-medium leading-tight text-[#D7E2EA] sm:text-[24px] md:text-[30px]">{c.title}</h3>
          </div>
        </div>
        <GhostButton onClick={onOpen}>
          사례 열기 <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
        </GhostButton>
      </div>

      <div className="grid gap-4 md:grid-cols-[40%_1fr] md:gap-5">
        <div className="flex flex-col gap-4">
          <div className="rounded-[28px] bg-[#16171a] p-5 sm:rounded-[36px] md:p-7">
            <p className="text-[15px] leading-relaxed text-[#D7E2EA] md:text-[17px]">{c.tagline}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <StatusChip kind={c.status.kind} label={c.status.label} />
              <span className="text-[12px] text-[#D7E2EA]/55">
                {c.period} · {c.role}
              </span>
            </div>
          </div>
          <div className="hidden rounded-[28px] bg-[#16171a] p-5 sm:block sm:rounded-[36px] md:p-7">
            <ul className="space-y-2.5">
              {c.decisions.slice(0, 2).map((d) => (
                <li key={d} className="grid grid-cols-[10px_1fr] gap-3 text-[13px] leading-relaxed text-[#D7E2EA]/75">
                  <span className="mt-[7px] h-1.5 w-1.5 rounded-full" style={{ background: "linear-gradient(135deg,#B600A8,#BE4C00)" }} />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpen}
          aria-label={`${c.title} 사례 열기`}
          className="group relative block h-[clamp(200px,34vh,420px)] overflow-hidden rounded-[28px] bg-[#16171a] sm:rounded-[40px] md:rounded-[50px]"
        >
          {img ? (
            <img src={img} alt="" loading="lazy" className="h-full w-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03]" />
          ) : (
            <div className="flex h-full items-center justify-center text-[#D7E2EA]/40">미리보기</div>
          )}
          <span className="absolute bottom-4 right-4 rounded-full bg-[#0C0C0C]/80 px-4 py-2 text-[11px] uppercase tracking-widest text-[#D7E2EA] opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
            직접 조작해 보기
          </span>
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- Overlay */
function CaseOverlay({ c, onClose }: { c: CaseStudy | null; onClose: () => void }) {
  useEffect(() => {
    if (!c) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [c, onClose]);

  const idx = c ? cases.findIndex((x) => x.id === c.id) : -1;
  const Demo = c ? DEMOS[c.demo] : null;

  return createPortal(
    <AnimatePresence>
      {c && Demo && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-[80]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label={c.title}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
            className="absolute inset-x-2 bottom-0 top-6 overflow-y-auto overscroll-contain rounded-t-[40px] border-2 border-b-0 border-[#D7E2EA] bg-[#0C0C0C] sm:inset-x-6 md:inset-x-10 md:top-10 md:rounded-t-[60px]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[#0C0C0C]/85 px-5 py-4 backdrop-blur md:px-10 md:py-6">
              <span className="text-[12px] uppercase tracking-[0.2em] text-[#D7E2EA]/55">
                사례 0{idx + 1} / 0{cases.length} · {c.area}
              </span>
              <button type="button" onClick={onClose} aria-label="닫기" className="press flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#D7E2EA]/40 hover:border-[#D7E2EA]">
                <X className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </div>

            <div className="grid gap-10 px-5 pb-16 pt-4 md:px-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
              <div>
                <div className="flex items-end gap-5">
                  <BigNum n={idx + 1} className="hero-heading" />
                </div>
                <h3 className="mt-4 text-[28px] font-medium leading-tight text-[#D7E2EA] md:text-[38px]">{c.title}</h3>
                <p className="mt-3 text-[16px] leading-relaxed text-[#D7E2EA]/80">{c.tagline}</p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <StatusChip kind={c.status.kind} label={c.status.label} />
                  <span className="text-[12px] text-[#D7E2EA]/55">
                    {c.period} · {c.role}
                  </span>
                </div>
                <dl className="mt-10 space-y-7 text-[14.5px] leading-[1.8]">
                  <Field k="문제">{c.problem}</Field>
                  <Field k="결정">
                    <ul className="space-y-2.5">
                      {c.decisions.map((d) => (
                        <li key={d} className="grid grid-cols-[10px_1fr] gap-3">
                          <span className="mt-[10px] h-1.5 w-1.5 rounded-full" style={{ background: "linear-gradient(135deg,#B600A8,#BE4C00)" }} />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </Field>
                  <Field k="결과" strong>
                    {c.result}
                  </Field>
                  <Field k="남은 과제" quiet>
                    {c.limit}
                  </Field>
                </dl>
                <div className="mt-8 flex flex-wrap gap-1.5">
                  {c.stack.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
              </div>
              <div className="lg:sticky lg:top-24 lg:self-start">
                <Demo />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Field({ k, children, strong, quiet }: { k: string; children: ReactNode; strong?: boolean; quiet?: boolean }) {
  return (
    <div>
      <dt className="mb-2 text-[12px] font-medium uppercase tracking-[0.2em] text-[#D7E2EA]/50">{k}</dt>
      <dd className={strong ? "text-[#D7E2EA]" : quiet ? "text-[#D7E2EA]/55" : "text-[#D7E2EA]/80"}>{children}</dd>
    </div>
  );
}
