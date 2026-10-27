import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { sideProjects, workflowByMonth, type CaseStudy } from "@/data/content";
import { techCases as cases, techPreview as casePreview, techProfile as profile, techTimeline as timeline } from "@/data/tech";
import { NeutralCopy } from "@/demos/copy";
import { DEMOS } from "@/sections/Cases";
import { Bar, BarChart, BarXAxis, ChartTooltip, Grid } from "@/vendor/bklit/charts";
import {
  ArrowUpRight,
  BlurIn,
  BlurInView,
  BlurText,
  ClockIcon,
  CloudIcon,
  FadingVideo,
  LayersIcon,
  LightbulbIcon,
  Play,
  ServerIcon,
} from "./kit";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4";
const CAP_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4";

const LINKS = [
  { label: "역량", href: "#capabilities" },
  { label: "사례", href: "#work" },
  { label: "기록", href: "#journey" },
  { label: "프로젝트", href: "#projects" },
  { label: "연락", href: "#contact" },
];

export default function AppB() {
  const [open, setOpen] = useState<CaseStudy | null>(null);
  useEffect(() => {
    document.title = "임채환 — 백엔드 엔지니어 포트폴리오";
  }, []);
  return (
    <NeutralCopy.Provider value={true}>
    <MotionConfig reducedMotion="user">
      <div className="theme-b min-h-screen bg-black font-body text-white">
        <Nav />
        <Hero onDemo={() => setOpen(cases[0])} />
        <Capabilities />
        <Work onOpen={setOpen} />
        <Journey />
        <Projects />
        <Contact />
        <CaseOverlay c={open} onClose={() => setOpen(null)} />
      </div>
    </MotionConfig>
    </NeutralCopy.Provider>
  );
}

/* --------------------------------------------------------------------- Nav */
function Nav() {
  return (
    <nav className="fixed left-0 right-0 top-4 z-50 flex items-center justify-between px-8 lg:px-16">
      <a href="#top" className="liquid-glass flex h-12 w-12 items-center justify-center rounded-full" aria-label="맨 위로">
        <span className="font-heading text-2xl italic">c</span>
      </a>
      <div className="liquid-glass hidden items-center rounded-full px-1.5 py-1.5 md:flex">
        {LINKS.map((l) => (
          <a key={l.label} href={l.href} className="rounded-full px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:text-white">
            {l.label}
          </a>
        ))}
        <a href={`mailto:${profile.email}`} className="ml-1 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform active:scale-[0.97]">
          연락하기 <ArrowUpRight />
        </a>
      </div>
      <a href={`mailto:${profile.email}`} className="liquid-glass flex h-12 items-center rounded-full px-4 text-sm font-medium md:hidden">
        연락하기
      </a>
      <div className="hidden h-12 w-12 md:block" />
    </nav>
  );
}

/* -------------------------------------------------------------------- Hero */
function Hero({ onDemo }: { onDemo: () => void }) {
  return (
    <section id="top" className="relative h-[100svh] min-h-[760px] overflow-hidden bg-black">
      <FadingVideo src={HERO_VIDEO} className="absolute left-1/2 top-0 z-0 -translate-x-1/2 object-cover object-top" style={{ width: "120%", height: "120%" }} />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-4 pt-24 text-center">
          <BlurIn delay={0.4} className="liquid-glass flex items-center gap-2 rounded-full py-1 pl-1 pr-4 text-sm text-white/90">
            <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-black">신규</span>
            영업시간 외 AI 응대 — 실제 서비스로 운영 중
          </BlurIn>

          <div className="mt-6 max-w-3xl">
            <BlurText
              as="h1"
              text={"외부가 흔들려도\n버티는 백엔드"}
              className="ko-display text-5xl text-white md:text-7xl lg:text-[5.25rem]"
            />
          </div>

          <BlurIn delay={0.8} className="mt-5 max-w-2xl">
            <p className="text-sm font-light leading-snug text-white md:text-base">
              임채환 · 백엔드 엔지니어. Kotlin·Spring으로 백엔드를 만듭니다. 늦고, 틀리고, 중간에 끊기는 외부 연동을 단계와 상태로 나누고, 그 코드가 GitOps·Kubernetes·네트워크를 지나 실제로 동작하는 곳까지 책임집니다.
            </p>
          </BlurIn>

          <BlurIn delay={1.1} className="mt-6 flex items-center gap-6">
            <a href="#work" className="liquid-glass-strong flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium">
              사례 보기 <ArrowUpRight />
            </a>
            <button type="button" onClick={onDemo} className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white">
              <Play className="h-3.5 w-3.5" /> 데모 바로 해보기
            </button>
          </BlurIn>

          <BlurIn delay={1.3} className="mt-8 flex flex-wrap justify-center gap-4">
            <Stat icon={<ClockIcon />} value="6" unit="개 사례" label="직접 조작해 볼 수 있는 대표 사례" />
            <Stat icon={<LayersIcon />} value="4" unit="개 계층" label="도메인 · 비동기 · 런타임 · AI" />
          </BlurIn>
        </div>

        <BlurIn delay={1.4} className="flex flex-col items-center gap-4 pb-8">
          <div className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/90 md:text-sm">매일 다루는 기술</div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-2 px-4 md:gap-x-16">
            {["Kotlin", "Spring", "Kubernetes", "Redis", "Qwen"].map((n) => (
              <span key={n} className="font-heading text-2xl italic tracking-tight text-white/90 md:text-3xl">
                {n}
              </span>
            ))}
          </div>
        </BlurIn>
      </div>
    </section>
  );
}

function Stat({ icon, value, unit, label }: { icon: ReactNode; value: string; unit: string; label: string }) {
  return (
    <div className="liquid-glass w-[220px] rounded-[1.25rem] p-5 text-left">
      <div className="text-white/90">{icon}</div>
      <div className="mt-4 flex items-baseline gap-0.5">
        <span className="font-heading text-5xl italic leading-none tracking-[-1px]">{value}</span>
        <span className="text-lg font-medium tracking-[-0.03em]">{unit}</span>
      </div>
      <div className="mt-2 text-xs font-light leading-snug text-white/80">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------ Capabilities */
const CAPS = [
  {
    title: "백엔드",
    icon: <ServerIcon />,
    tags: ["Kotlin", "Spring Boot", "Redis", "RabbitMQ"],
    body: "외부 연동의 실패 조건을 단계·상태·재처리 지점으로 나눕니다. 파일 배치 파이프라인, 이력 판정 정합성, 다중 인스턴스 알림.",
  },
  {
    title: "배포 · 운영",
    icon: <CloudIcon />,
    tags: ["Docker", "GKE", "Argo CD", "NCP"],
    body: "코드가 이미지·매니페스트·인증서·방화벽을 지나 도착하는 곳까지. GitOps 온보딩, 클라우드 간 HTTPS 전환, health check 분리.",
  },
  {
    title: "AI 시스템",
    icon: <LightbulbIcon />,
    tags: ["RAG", "Qwen LoRA", "BGE-M3", "A100"],
    body: "모델은 계약 안에 둡니다. 영업시간 외 AI 응대 서비스 운영, GPU 배치 평가 파이프라인, 승인 FAQ 기반 검색.",
  },
];

function Capabilities() {
  return (
    <section id="capabilities" className="relative min-h-screen overflow-hidden bg-black">
      <FadingVideo src={CAP_VIDEO} className="absolute inset-0 z-0 h-full w-full object-cover" />
      <div className="relative z-10 flex min-h-screen flex-col px-8 pb-10 pt-24 md:px-16 lg:px-20">
        <div className="mb-auto">
          <BlurInView>
            <div className="mb-6 text-sm text-white/80">// 역량</div>
          </BlurInView>
          <BlurText
            as="h2"
            justify="flex-start"
            text={"코드부터 운영까지,\n끝까지 책임지는 백엔드"}
            className="ko-display text-5xl md:text-6xl lg:text-7xl"
          />
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {CAPS.map((c, i) => (
            <BlurInView key={c.title} delay={i * 0.12} className="liquid-glass flex min-h-[360px] flex-col rounded-[1.25rem] p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="liquid-glass flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.75rem]">{c.icon}</div>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {c.tags.map((t) => (
                    <span key={t} className="liquid-glass whitespace-nowrap rounded-full px-3 py-1 text-[11px] text-white/90">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex-1" />
              <h3 className="ko-display text-3xl md:text-4xl">{c.title}</h3>
              <p className="mt-3 max-w-[32ch] text-sm font-light leading-snug text-white/90">{c.body}</p>
            </BlurInView>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- Work */
function Work({ onOpen }: { onOpen: (c: CaseStudy) => void }) {
  return (
    <section id="work" className="relative bg-black px-8 py-28 md:px-16 lg:px-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/[0.04] to-transparent" />
      <BlurInView>
        <div className="mb-6 text-sm text-white/80">// 대표 사례 · {profile.since} 현재</div>
      </BlurInView>
      <BlurText as="h2" justify="flex-start" text={"실패를 견디도록 만든\n여섯 가지 사례"} className="ko-display text-5xl md:text-6xl lg:text-7xl" />
      <BlurInView delay={0.2}>
        <p className="mt-6 max-w-xl text-sm font-light leading-relaxed text-white/80 md:text-base">
          카드를 열면 사례 설명과 함께 실제로 조작해 볼 수 있는 패널이 나옵니다. 데이터는 예시이고, 구조와 판단은 실제 작업 그대로입니다.
        </p>
      </BlurInView>

      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cases.map((c, i) => (
          <BlurInView key={c.id} delay={(i % 3) * 0.1}>
            <button type="button" onClick={() => onOpen(c)} className="liquid-glass group flex h-full w-full flex-col rounded-[1.25rem] p-3 text-left">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[0.9rem] bg-white/[0.03]">
                {casePreview[c.demo] && (
                  <img src={casePreview[c.demo]} alt="" loading="lazy" className="h-full w-full object-cover object-top opacity-80 transition-[transform,opacity] duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-100" />
                )}
                <span className="liquid-glass-strong absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Play className="h-3 w-3" /> 열어서 조작하기
                </span>
              </div>
              <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-heading text-3xl italic leading-none tracking-[-1px] text-white/60">0{i + 1}</span>
                  <span className={`rounded-full px-3 py-1 text-[11px] ${c.status.kind === "service" ? "bg-white text-black" : "liquid-glass text-white/90"}`}>{c.status.label}</span>
                </div>
                <div className="mt-4 text-[11px] uppercase tracking-[0.18em] text-white/50">{c.area}</div>
                <h3 className="mt-1 text-lg font-medium leading-snug">{c.title}</h3>
                <p className="mt-2 text-sm font-light leading-snug text-white/75">{c.tagline}</p>
              </div>
            </button>
          </BlurInView>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Journey */
const SERIES = [
  { key: "backend", label: "백엔드", color: "#ffffff" },
  { key: "frontend", label: "프론트엔드", color: "rgba(255,255,255,0.35)" },
  { key: "infra", label: "인프라", color: "#9fb7a0" },
  { key: "ai", label: "AI", color: "#ff7a45" },
] as const;

function Journey() {
  return (
    <section id="journey" className="relative bg-black px-8 py-28 md:px-16 lg:px-20">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <BlurInView>
            <div className="mb-6 text-sm text-white/80">// 기록 · 2026.04 — 10</div>
          </BlurInView>
          <BlurText as="h2" justify="flex-start" text={"7개월,\n네 개의 계층"} className="ko-display text-5xl md:text-6xl lg:text-7xl" />
          <BlurInView delay={0.2}>
            <p className="mt-6 max-w-md text-sm font-light leading-relaxed text-white/80">
              백엔드에서 시작해 인프라와 AI로 넓어졌다가, 다시 도메인으로 돌아왔습니다. 막대는 월별 커밋의 영역 분포로, 생산성 지표가 아니라 작업이 어디로 이동했는지 보는 지도입니다.
            </p>
          </BlurInView>
          <BlurInView delay={0.3} className="liquid-glass mt-10 rounded-[1.25rem] p-5">
            <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/80">
              {SERIES.map((s) => (
                <span key={s.key} className="flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
              ))}
            </div>
            <div className="h-[220px]">
              <BarChart data={workflowByMonth} xDataKey="month" stacked stackGap={2} aspectRatio="auto" className="h-full">
                <Grid horizontal />
                {SERIES.map((s) => (
                  <Bar key={s.key} dataKey={s.key} fill={s.color} lineCap={6} stackGap={2} />
                ))}
                <BarXAxis />
                <ChartTooltip rows={(p) => SERIES.filter((s) => (p[s.key] as number) > 0).map((s) => ({ color: s.color, label: s.label, value: p[s.key] as number }))} />
              </BarChart>
            </div>
          </BlurInView>
        </div>

        <ol className="space-y-3">
          {timeline.map((t, i) => (
            <BlurInView key={t.month} delay={0.05 * i} className="liquid-glass grid grid-cols-[auto_1fr] gap-6 rounded-[1.25rem] p-5 md:p-6">
              <span className="font-heading text-4xl italic leading-none tracking-[-1px] text-white/70">{t.month.slice(5)}</span>
              <ul className="space-y-1">
                {t.items.map((it) => (
                  <li key={it} className="text-sm font-light leading-snug text-white/90 md:text-[15px]">
                    {it}
                  </li>
                ))}
              </ul>
            </BlurInView>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Projects */
function Projects() {
  return (
    <section id="projects" className="relative bg-black px-8 py-28 md:px-16 lg:px-20">
      <BlurInView>
        <div className="mb-6 text-sm text-white/80">// 개인 프로젝트</div>
      </BlurInView>
      <BlurText as="h2" justify="flex-start" text={"기본기를\n끝까지 파고든 프로젝트"} className="ko-display text-5xl md:text-6xl lg:text-7xl" />
      <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {sideProjects.map((p, i) => (
          <BlurInView key={p.title} delay={i * 0.12} className="liquid-glass flex min-h-[420px] flex-col rounded-[1.25rem] p-6">
            <div className="flex items-start justify-between gap-4">
              <span className="font-heading text-4xl italic leading-none tracking-[-1px] text-white/60">0{i + 1}</span>
              <span className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90">{p.kind}</span>
            </div>
            <h3 className="mt-8 text-2xl font-medium leading-[1.2] tracking-[-0.01em]">{p.title}</h3>
            <p className="mt-4 text-sm font-light leading-snug text-white/85">{p.summary}</p>
            <div className="flex-1" />
            <div className="mt-6 space-y-2">
              {p.troubles.slice(0, 2).map((t) => (
                <div key={t.title} className="liquid-glass rounded-[0.9rem] p-3">
                  <div className="text-[13px] font-medium">{t.title}</div>
                  <div className="mt-1 text-[12px] font-light leading-snug text-white/70">→ {t.fix}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {p.stack.slice(0, 5).map((s) => (
                <span key={s} className="liquid-glass whitespace-nowrap rounded-full px-3 py-1 text-[11px] text-white/90">
                  {s}
                </span>
              ))}
            </div>
          </BlurInView>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Contact */
function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };
  return (
    <section id="contact" className="relative flex min-h-screen flex-col overflow-hidden bg-black">
      <FadingVideo src={HERO_VIDEO} className="absolute inset-0 z-0 h-full w-full scale-x-[-1] object-cover" style={{ filter: "brightness(0.7)" }} />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <BlurInView>
          <div className="liquid-glass rounded-full px-4 py-1.5 text-sm text-white/90">// 연락</div>
        </BlurInView>
        <div className="mt-6 max-w-4xl">
          <BlurText as="h2" text={"버티는 구조를\n함께 만들어요"} className="ko-display text-5xl md:text-7xl lg:text-[5.25rem]" />
        </div>
        <BlurInView delay={0.4} className="mt-6 max-w-xl">
          <p className="text-sm font-light leading-snug text-white md:text-base">외부 연동이 많고 운영 경계가 중요한 제품에 관심이 많습니다. 같이 만들 구조가 있다면 편하게 연락 주세요.</p>
        </BlurInView>
        <BlurInView delay={0.6} className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a href={`mailto:${profile.email}`} className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black active:scale-[0.97]">
            메일 보내기 <ArrowUpRight />
          </a>
          <button type="button" onClick={copy} className="liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-medium">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={copied ? "c" : "e"} initial={{ y: 10, opacity: 0, filter: "blur(4px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: -10, opacity: 0, filter: "blur(4px)" }} transition={{ duration: 0.25 }} className="inline-block">
                {copied ? "복사했습니다" : profile.email}
              </motion.span>
            </AnimatePresence>
          </button>
          <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white">
            GitHub <ArrowUpRight />
          </a>
        </BlurInView>
      </div>
      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-8 pb-8 text-xs text-white/60 md:px-16">
        <span>© 2026 {profile.name}</span>
        <span>디자인 시안 B · 리퀴드 글래스</span>
      </footer>
    </section>
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
        <motion.div key="ov" className="theme-b fixed inset-0 z-[80] font-body text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={c.title}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose} />
          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 40 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            exit={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="liquid-glass-strong absolute inset-3 overflow-y-auto overscroll-contain rounded-[1.75rem] md:inset-8"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 md:px-10">
              <span className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/90">
                사례 0{idx + 1} / 0{cases.length} · {c.area}
              </span>
              <button type="button" onClick={onClose} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
                닫기
              </button>
            </div>
            <div className="grid gap-10 px-6 pb-14 md:px-10 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <h3 className="text-4xl font-medium leading-[1.1] tracking-[-0.02em] md:text-5xl">{c.title}</h3>
                <p className="mt-4 text-base font-light leading-snug text-white/85">{c.tagline}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className={`rounded-full px-3 py-1 ${c.status.kind === "service" ? "bg-white text-black" : "liquid-glass"}`}>{c.status.label}</span>
                  <span className="text-white/60">
                    {c.period} · {c.role}
                  </span>
                </div>
                <dl className="mt-8 space-y-6 text-sm font-light leading-relaxed">
                  <Field k="문제">{c.problem}</Field>
                  <Field k="결정">
                    <ul className="space-y-2">
                      {c.decisions.map((d) => (
                        <li key={d} className="flex gap-3">
                          <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-white" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </Field>
                  <Field k="결과">{c.result}</Field>
                  <Field k="남은 과제">
                    <span className="text-white/60">{c.limit}</span>
                  </Field>
                </dl>
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {c.stack.map((s) => (
                    <span key={s} className="liquid-glass rounded-full px-3 py-1 text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="lg:sticky lg:top-20 lg:self-start">
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

function Field({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div>
      <dt className="mb-1.5 text-sm font-medium tracking-[-0.01em] text-white/60">{k}</dt>
      <dd className="text-white/90">{children}</dd>
    </div>
  );
}
