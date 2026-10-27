/* Variant E — B + D merged.
   D's skeleton (dark editorial, bento, pinned parallax gallery, overlay with prev/next, GSAP marquee)
   + B's message (headline, live-service badge, proof cards), capabilities and journey chart.
   Fixes from the B/D review: loading screen once per session and shorter, taglines visible on touch,
   hls.js loaded on demand, gallery text readable on phones. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Hls from "hls.js";
import { education, sideProjects, stack, workflowByMonth, type CaseStudy } from "@/data/content";
import { techCases as cases, techGallery, techOtherWork as otherWork, techPreview as casePreview, techProfile as profile, techTimeline as timeline } from "@/data/tech";
import { NeutralCopy } from "@/demos/copy";
import { DEMOS } from "@/sections/Cases";
import { Bar, BarChart, BarXAxis, ChartTooltip, Grid } from "@/vendor/bklit/charts";
import { ClockIcon, CloudIcon, LayersIcon, LightbulbIcon, Play, ServerIcon } from "../b/kit";
import "../d/d.css";

gsap.registerPlugin(ScrollTrigger);

const HLS_SRC = "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";
const EASE = [0.25, 0.1, 0.25, 1] as const;

export default function App() {
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem("pf-e-intro");
    } catch {
      return true;
    }
  });
  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem("pf-e-intro", "1");
    } catch {
      /* private mode: show the intro again next time, nothing else breaks */
    }
    setLoading(false);
  }, []);
  const [open, setOpen] = useState<CaseStudy | null>(null);
  const closeCase = useCallback(() => setOpen(null), []);

  useEffect(() => {
    document.title = "임채환 — 백엔드 엔지니어 포트폴리오";
  }, []);

  return (
    <NeutralCopy.Provider value={true}>
    <div className="theme-d min-h-screen overflow-x-clip">
      <AnimatePresence>{loading && <LoadingScreen onComplete={finishIntro} />}</AnimatePresence>
      <Navbar />
      <Hero ready={!loading} onDemo={() => setOpen(cases[cases.length - 1])} />
      <Capabilities />
      <Works onOpen={setOpen} />
      <Journey />
      <Shipped />
      <Explorations />
      <Stats />
      <Builds />
      <Contact />
      <CaseOverlay c={open} onClose={closeCase} onNavigate={setOpen} />
    </div>
    </NeutralCopy.Provider>
  );
}

/* ------------------------------------------------------------ helpers */
function GradientButton({ href, onClick, children, solid = false, className = "" }: { href?: string; onClick?: () => void; children: ReactNode; solid?: boolean; className?: string }) {
  const inner = solid
    ? "bg-[var(--d-text)] text-[var(--d-bg)] group-hover:bg-[var(--d-bg)] group-hover:text-[var(--d-text)]"
    : "border-2 border-[var(--d-stroke)] bg-[var(--d-bg)] text-[var(--d-text)] group-hover:border-transparent";
  const content = (
    <>
      <span className="accent-ring" aria-hidden />
      <span className={`inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm transition-colors duration-300 ${inner}`}>{children}</span>
    </>
  );
  const cls = `group relative isolate inline-flex rounded-full transition-transform duration-300 hover:scale-105 ${className}`;
  return href ? (
    <a href={href} className={cls} {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
      {content}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {content}
    </button>
  );
}

function SectionHeader({ eyebrow, title, accent, sub, action }: { eyebrow: string; title: string; accent: string; sub: string; action?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, ease: EASE }}
      className="mb-10 flex items-end justify-between gap-6 md:mb-14"
    >
      <div>
        <div className="mb-5 flex items-center gap-3">
          <span className="h-px w-8 bg-[var(--d-stroke)]" />
          <span className="text-xs tracking-[0.2em] text-[var(--d-muted)]">{eyebrow}</span>
        </div>
        <h2 className="ko-display text-4xl md:text-5xl lg:text-6xl">
          {title} <span className="accent-text">{accent}</span>
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--d-muted)] md:text-base">{sub}</p>
      </div>
      {action && <div className="hidden shrink-0 md:inline-flex">{action}</div>}
    </motion.div>
  );
}

function HlsVideo({ className, flip = false }: { className?: string; flip?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let hls: Hls | null = null;
    let cancelled = false;
    if (v.canPlayType("application/vnd.apple.mpegurl")) {
      v.src = HLS_SRC; // Safari / iOS: native HLS, no library needed
    } else {
      // hls.js (~0.5 MB) is fetched only when a video actually needs it.
      import("hls.js")
        .then(({ default: HlsLib }) => {
          if (cancelled) return;
          if (!HlsLib.isSupported()) return setFailed(true);
          hls = new HlsLib({ capLevelToPlayerSize: true });
          hls.loadSource(HLS_SRC);
          hls.attachMedia(v);
          hls.on(HlsLib.Events.ERROR, (_e, data) => {
            if (data.fatal) setFailed(true);
          });
        })
        .catch(() => setFailed(true));
    }
    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, []);
  if (failed) return null;
  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      aria-hidden
      onError={() => setFailed(true)}
      className={`absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover ${flip ? "scale-y-[-1]" : ""} ${className ?? ""}`}
    />
  );
}

/* ------------------------------------------------------- loading screen */
const WORDS = ["설계", "구현", "운영"];
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [word, setWord] = useState(0);
  const still = useReducedMotion();
  useEffect(() => {
    const total = still ? 300 : 1300;
    let raf = 0;
    let t: number | undefined;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / total);
      setCount(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else t = window.setTimeout(onComplete, 250);
    };
    raf = requestAnimationFrame(tick);
    const iv = window.setInterval(() => setWord((w) => (w + 1) % WORDS.length), 430);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(iv);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-[var(--d-bg)]"
      exit={{ opacity: 0, transition: { duration: 0.6, ease: EASE } }}
      role="status"
      aria-label={`불러오는 중 ${count}%`}
    >
      <motion.span
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="absolute left-6 top-6 text-xs tracking-[0.3em] text-[var(--d-muted)] md:left-10 md:top-10"
      >
        포트폴리오
      </motion.span>
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={WORDS[word]}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="ko-display text-4xl text-[var(--d-text)]/80 md:text-6xl lg:text-7xl"
          >
            {WORDS[word]}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="font-d-display absolute bottom-8 right-6 text-6xl tabular-nums leading-none text-[var(--d-text)] md:right-10 md:text-8xl lg:text-9xl">
        {String(count).padStart(3, "0")}
      </span>
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[var(--d-stroke)]/50">
        <div
          className="accent-gradient h-full origin-left"
          style={{ transform: `scaleX(${count / 100})`, boxShadow: "0 0 8px rgba(137, 170, 204, 0.35)" }}
        />
      </div>
    </motion.div>
  );
}

/* ----------------------------------------------------------------- nav */
const NAV = [
  { label: "홈", href: "#home" },
  { label: "역량", href: "#capabilities" },
  { label: "사례", href: "#work" },
  { label: "기록", href: "#journey" },
];
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("홈");
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 100);
      let current = "홈";
      for (const n of NAV.slice(1)) {
        const top = document.querySelector(n.href)?.getBoundingClientRect().top ?? 1;
        if (top < 200) current = n.label;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const divider = <span className="mx-1 hidden h-5 w-px bg-[var(--d-stroke)] sm:block" />;
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 md:pt-6" aria-label="주 메뉴">
      <div className={`inline-flex items-center rounded-full border border-white/10 bg-[var(--d-surface)] px-2 py-2 backdrop-blur-md transition-shadow ${scrolled ? "shadow-md shadow-black/10" : ""}`}>
        <a href="#home" className="group mr-1 flex" aria-label="맨 위로">
          <span className="d-logo-ring flex h-9 w-9 items-center justify-center rounded-full p-[1.5px]">
            <span className="font-d-display flex h-full w-full items-center justify-center rounded-full bg-[var(--d-bg)] text-[13px] italic">CH</span>
          </span>
        </a>
        {divider}
        {NAV.map((n) => (
          <a
            key={n.label}
            href={n.href}
            className={`rounded-full px-3 py-1.5 text-xs transition-colors sm:px-4 sm:py-2 sm:text-sm ${active === n.label ? "bg-[var(--d-stroke)]/50 text-[var(--d-text)]" : "text-[var(--d-muted)] hover:bg-[var(--d-stroke)]/50 hover:text-[var(--d-text)]"}`}
          >
            {n.label}
          </a>
        ))}
        {divider}
        <a href="#contact" className="group relative isolate ml-1 inline-flex rounded-full">
          <span className="accent-ring" aria-hidden />
          <span className="rounded-full bg-[var(--d-surface)] px-3 py-1.5 text-xs backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm">연락하기 ↗</span>
        </a>
      </div>
    </nav>
  );
}

/* ---------------------------------------------------------------- hero */
const ROLES = ["백엔드", "Kotlin · Spring", "GitOps", "AI 파이프라인"];
function Hero({ ready, onDemo }: { ready: boolean; onDemo: () => void }) {
  const root = useRef<HTMLElement>(null);
  const [role, setRole] = useState(0);
  useEffect(() => {
    const iv = window.setInterval(() => setRole((r) => (r + 1) % ROLES.length), 2000);
    return () => clearInterval(iv);
  }, []);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".name-reveal", { opacity: 0, y: 50 });
      gsap.set(".blur-in", { opacity: 0, y: 20, filter: "blur(10px)" });
    }, root);
    return () => ctx.revert();
  }, []);
  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(".name-reveal", { opacity: 1, y: 0, duration: 1.2, delay: 0.1 }, 0);
      tl.to(".blur-in", { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, stagger: 0.08, delay: 0.3 }, 0);
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section ref={root} id="home" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pb-16 pt-28 md:pt-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,#1b2633_0%,var(--d-bg)_70%)]" />
      <HlsVideo />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--d-bg)] to-transparent" />

      <div className="relative z-10 flex w-full max-w-[1100px] flex-col items-center px-6 text-center">
        <a href="#work" className="blur-in liquid-glass mb-8 inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-4 text-xs text-[var(--d-text)]/90 sm:text-sm">
          <span className="accent-gradient rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-[#0a0a0a]">신규</span>
          영업시간 외 AI 응대 — 실제 서비스 운영 중
        </a>
        <h1 className="name-reveal ko-display text-[2.9rem] sm:text-6xl md:text-7xl lg:text-[5.75rem]">
          외부가 흔들려도
          <br />
          <span className="accent-text">버티는 백엔드</span>
        </h1>
        <p className="blur-in mt-6 text-base text-[var(--d-text)]/90 md:text-lg">
          {profile.name} <span className="font-d-display italic text-[var(--d-muted)]">{profile.nameEn}</span> ·{" "}
          <span key={role} className="animate-role-fade-in accent-text inline-block font-semibold">
            {ROLES[role]}
          </span>{" "}
          엔지니어
        </p>
        <p className="blur-in mt-4 max-w-xl text-sm leading-relaxed text-[var(--d-muted)] md:text-base">
          Kotlin·Spring으로 백엔드를 만듭니다. 늦고, 틀리고, 중간에 끊기는 외부 연동을 단계와 상태로 나누고, 그 코드가 GitOps·Kubernetes·네트워크를 지나 실제로 동작하는 곳까지 책임집니다.
        </p>
        <div className="blur-in mt-9 inline-flex flex-wrap justify-center gap-3 sm:gap-4">
          <GradientButton href="#work" solid>
            사례 보기
          </GradientButton>
          <GradientButton onClick={onDemo}>
            <Play className="h-3 w-3" /> 데모 바로 해보기
          </GradientButton>
        </div>

        <div className="blur-in mt-12 grid w-full max-w-[560px] grid-cols-2 gap-3 sm:gap-4">
          <ProofCard icon={<ClockIcon className="h-5 w-5" />} value="6" unit="개 사례" label="직접 조작해 볼 수 있는 대표 사례" />
          <ProofCard icon={<LayersIcon className="h-5 w-5" />} value="4" unit="개 계층" label="도메인 · 비동기 · 런타임 · AI" />
        </div>

        <div className="blur-in mt-10 flex flex-col items-center gap-3">
          <span className="text-xs tracking-[0.2em] text-[var(--d-muted)]">매일 다루는 기술</span>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-1 md:gap-x-12">
            {["Kotlin", "Spring", "Kubernetes", "Redis", "Qwen"].map((n) => (
              <span key={n} className="font-d-display text-2xl italic text-[var(--d-text)]/85 md:text-3xl">
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProofCard({ icon, value, unit, label }: { icon: ReactNode; value: string; unit: string; label: string }) {
  return (
    <div className="liquid-glass rounded-[1.25rem] bg-[var(--d-surface)]/40 p-4 text-left sm:p-5">
      <div className="text-[var(--d-text)]/85">{icon}</div>
      <div className="mt-3 flex items-baseline gap-0.5">
        <span className="font-d-display text-4xl italic leading-none sm:text-5xl">{value}</span>
        <span className="ko-display text-base sm:text-lg">{unit}</span>
      </div>
      <div className="mt-2 text-[11px] leading-snug text-[var(--d-muted)] sm:text-xs">{label}</div>
    </div>
  );
}

/* --------------------------------------------------------- capabilities (from B) */
const CAPS = [
  { title: "백엔드", icon: <ServerIcon />, tags: ["Kotlin", "Spring Boot", "Redis", "RabbitMQ"], body: "외부 연동의 실패 조건을 단계·상태·재처리 지점으로 나눕니다. 파일 배치 파이프라인, 이력 판정 정합성, 다중 인스턴스 알림." },
  { title: "배포 · 운영", icon: <CloudIcon />, tags: ["Docker", "GKE", "Argo CD", "NCP"], body: "코드가 이미지·매니페스트·인증서·방화벽을 지나 도착하는 곳까지. GitOps 온보딩, 클라우드 간 HTTPS 전환, health check 분리." },
  { title: "AI 시스템", icon: <LightbulbIcon />, tags: ["RAG", "Qwen LoRA", "BGE-M3", "A100"], body: "모델은 계약 안에 둡니다. 영업시간 외 AI 응대 서비스 운영, GPU 배치 평가 파이프라인, 승인 FAQ 기반 검색." },
];
function Capabilities() {
  return (
    <section id="capabilities" className="scroll-mt-24 bg-[var(--d-bg)] py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <SectionHeader eyebrow="역량" title="코드부터 운영까지," accent="끝까지 책임집니다" sub="세 개의 층을 오가며 일합니다. 각 층의 대표 작업은 아래 사례에서 직접 조작해 볼 수 있습니다." />
        <div className="grid gap-5 md:grid-cols-3">
          {CAPS.map((c, i) => (
            <motion.article
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
              className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-3xl border border-[var(--d-stroke)] bg-[var(--d-surface)] p-6 md:min-h-[340px] md:p-7"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-40" style={{ background: "radial-gradient(circle,#4e85bf,transparent 70%)" }} />
              <div className="flex items-start justify-between gap-4">
                <span className="d-logo-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl p-[1.5px]">
                  <span className="flex h-full w-full items-center justify-center rounded-[14px] bg-[var(--d-bg)] text-[var(--d-text)]">{c.icon}</span>
                </span>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {c.tags.map((t) => (
                    <span key={t} className="whitespace-nowrap rounded-full border border-[var(--d-stroke)] px-3 py-1 text-[11px] text-[var(--d-muted)]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex-1" />
              <h3 className="ko-display mt-10 text-3xl">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--d-muted)]">{c.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- journey (from B) */
const SERIES = [
  { key: "backend", label: "백엔드", color: "#f5f5f5" },
  { key: "frontend", label: "프론트엔드", color: "#4a4a4a" },
  { key: "infra", label: "인프라", color: "#89aacc" },
  { key: "ai", label: "AI", color: "#4e85bf" },
] as const;
function Journey() {
  return (
    <section id="journey" className="scroll-mt-24 bg-[var(--d-bg)] py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <SectionHeader
          eyebrow={`기록 · ${profile.since} 현재`}
          title="7개월,"
          accent="네 개의 계층"
          sub="백엔드에서 시작해 인프라와 AI로 넓어졌다가, 다시 도메인으로 돌아왔습니다. 막대는 월별 커밋의 영역 분포로, 생산성 지표가 아니라 작업이 어디로 이동했는지 보는 지도입니다."
        />
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: EASE }}
            className="self-start rounded-3xl border border-[var(--d-stroke)] bg-[var(--d-surface)] p-5 md:p-7 lg:sticky lg:top-28"
          >
            <div className="mb-1 text-sm text-[var(--d-text)]/90">월별 작업 영역</div>
            <div className="mb-5 text-xs text-[var(--d-muted)]">merge 제외 커밋 · 생산성 지표 아님</div>
            <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--d-muted)]">
              {SERIES.map((x) => (
                <span key={x.key} className="flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-full" style={{ background: x.color }} />
                  {x.label}
                </span>
              ))}
            </div>
            <div className="h-[240px]">
              <BarChart data={workflowByMonth} xDataKey="month" stacked stackGap={2} aspectRatio="auto" className="h-full">
                <Grid horizontal />
                {SERIES.map((x) => (
                  <Bar key={x.key} dataKey={x.key} fill={x.color} lineCap={6} stackGap={2} />
                ))}
                <BarXAxis />
                <ChartTooltip rows={(p) => SERIES.filter((x) => (p[x.key] as number) > 0).map((x) => ({ color: x.color, label: x.label, value: p[x.key] as number }))} />
              </BarChart>
            </div>
          </motion.div>
          <ol className="space-y-3">
            {timeline.map((t, i) => (
              <motion.li
                key={t.month}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.03 }}
                className="grid grid-cols-[auto_1fr] items-start gap-5 rounded-3xl border border-[var(--d-stroke)] bg-[var(--d-surface)]/30 p-5 transition-colors hover:bg-[var(--d-surface)] md:gap-7 md:p-6"
              >
                <span className="font-d-display w-12 text-4xl italic leading-none text-[var(--d-text)]/75">
                  {Number(t.month.slice(5))}
                  <span className="ko-display ml-0.5 align-top text-sm not-italic text-[var(--d-muted)]">월</span>
                </span>
                <ul className="space-y-1">
                  {t.items.map((it) => (
                    <li key={it} className="text-sm leading-relaxed text-[var(--d-text)]/85 md:text-[15px]">
                      {it}
                    </li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- works */
const SPANS = ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7", "md:col-span-7", "md:col-span-5"];
function Works({ onOpen }: { onOpen: (c: CaseStudy) => void }) {
  return (
    <section id="work" className="scroll-mt-24 bg-[var(--d-bg)] py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <SectionHeader
          eyebrow="대표 사례"
          title="직접 설계하고 구현한"
          accent="여섯 가지 사례"
          sub="설계부터 운영 확인까지 맡은 여섯 가지. 카드를 열면 문제·결정·결과와 직접 조작해 볼 수 있는 데모가 나옵니다."
          action={<GradientButton onClick={() => onOpen(cases[0])}>첫 사례 열기 →</GradientButton>}
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
          {cases.map((c, i) => (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => onOpen(c)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, ease: EASE, delay: (i % 2) * 0.08 }}
              className={`group relative overflow-hidden rounded-3xl border border-[var(--d-stroke)] bg-[var(--d-surface)] text-left ${SPANS[i]} ${SPANS[i].includes("7") ? "aspect-[16/11]" : "aspect-[4/3.75]"}`}
              aria-label={`${c.title} 열기`}
            >
              {casePreview[c.demo] && (
                <img src={casePreview[c.demo]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105" />
              )}
              <div className="halftone pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent p-5 pt-20 md:p-6 md:pt-24">
                <p className="text-[11px] tracking-[0.12em] text-white/60">
                  0{i + 1} · {c.area}
                </p>
                <p className="mt-2 text-lg leading-snug text-white md:text-xl">{c.title}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/70 [@media(hover:hover)]:hidden">{c.tagline}</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--d-bg)]/70 opacity-0 backdrop-blur-lg transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="gradient-border-pill rounded-full">
                  <span className="relative block rounded-full bg-white px-5 py-2.5 text-sm text-black">
                    자세히 보기 — <span className="font-d-display italic">0{i + 1}</span>
                  </span>
                </span>
                <p className="absolute inset-x-6 bottom-6 text-center text-sm leading-relaxed text-[var(--d-text)]/85">{c.tagline}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- shipped log */
const MONTHS = ["2026.10", "2026.10", "2026.06", "2026.09", "2026.07", "2026.08"];
function Shipped() {
  return (
    <section id="more" className="scroll-mt-24 bg-[var(--d-bg)] py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <SectionHeader eyebrow="그 밖의 작업" title="작지만," accent="같은 원칙으로" sub="사례로 따로 쓰진 않았지만, 같은 원칙으로 만든 작업들입니다." />
        <div className="flex flex-col gap-3">
          {otherWork.map((w, i) => (
            <motion.article
              key={w.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.05 }}
              className="group flex items-center gap-4 rounded-[32px] border border-[var(--d-stroke)] bg-[var(--d-surface)]/30 p-4 transition-colors hover:bg-[var(--d-surface)] sm:gap-6 sm:rounded-full sm:pr-8"
            >
              <span className="font-d-display flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--d-stroke)] text-2xl italic text-[var(--d-text)]/80 sm:h-16 sm:w-16">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base text-[var(--d-text)] sm:text-lg">{w.title}</h3>
                <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[var(--d-muted)] sm:line-clamp-1 sm:text-sm">{w.body}</p>
              </div>
              <div className="hidden shrink-0 flex-col items-end gap-1 text-xs text-[var(--d-muted)] md:flex">
                <span className="rounded-full border border-[var(--d-stroke)] px-3 py-1 text-[var(--d-text)]/80">{w.tag}</span>
                <span>{MONTHS[i]}</span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------- explorations gallery */
const GALLERY = techGallery;
const ROT = [-4, 3, -2, 5, -3, 2];

function Explorations() {
  const section = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const colA = useRef<HTMLDivElement>(null);
  const colB = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<(typeof GALLERY)[number] | null>(null);
  const still = useReducedMotion();

  useEffect(() => {
    if (still) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: section.current, start: "top top", end: "bottom bottom", pin: content.current, pinSpacing: false });
      gsap.fromTo(colA.current, { y: "20vh" }, { y: "-60vh", ease: "none", scrollTrigger: { trigger: section.current, start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo(colB.current, { y: "60vh" }, { y: "-30vh", ease: "none", scrollTrigger: { trigger: section.current, start: "top bottom", end: "bottom top", scrub: true } });
    }, section);
    return () => ctx.revert();
  }, [still]);

  const cols = [GALLERY.filter((_, i) => i % 2 === 0), GALLERY.filter((_, i) => i % 2 === 1)];
  return (
    <section ref={section} className="relative min-h-[300vh] bg-[var(--d-bg)]" aria-label="데모 장면 모음">
      <div ref={content} className="pointer-events-none relative z-30 flex h-screen flex-col items-center justify-center px-6 text-center md:z-10">
        <div className="pointer-events-auto flex flex-col items-center rounded-3xl bg-[var(--d-bg)]/70 px-5 py-8 backdrop-blur-md md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="mb-5 flex items-center gap-3">
          <span className="h-px w-8 bg-[var(--d-stroke)]" />
          <span className="text-xs tracking-[0.3em] text-[var(--d-muted)]">둘러보기</span>
          <span className="h-px w-8 bg-[var(--d-stroke)]" />
        </div>
        <h2 className="ko-display text-5xl md:text-7xl">
          직접 만져 본 <span className="accent-text">장면들</span>
        </h2>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--d-muted)] md:text-base">
          사례 패널을 실제로 조작한 장면들입니다. 실패 경로, 체크포인트 재개, 담당자 선응대처럼 정상 흐름 밖의 상태를 골랐습니다.
        </p>
        <div className="mt-8">
          <GradientButton href={profile.github}>GitHub ↗</GradientButton>
        </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="sticky top-0 mx-auto grid h-screen max-w-[1400px] grid-cols-2 gap-12 overflow-visible px-6 md:gap-40 md:px-10">
          {cols.map((col, ci) => (
            <div key={ci} ref={ci === 0 ? colA : colB} className={`flex flex-col gap-[30vh] ${ci === 0 ? "items-start" : "items-end"}`}>
              {col.map((g, gi) => {
                const idx = ci + gi * 2;
                return (
                  <button
                    key={g.src}
                    type="button"
                    onClick={() => setZoom(g)}
                    style={{ rotate: `${ROT[idx]}deg` }}
                    className="pointer-events-auto group relative aspect-square w-full max-w-[150px] sm:max-w-[240px] md:max-w-[320px] overflow-hidden rounded-2xl border border-[var(--d-stroke)] bg-[var(--d-surface)] shadow-2xl shadow-black/40 transition-transform duration-500 hover:rotate-0 hover:scale-[1.03]"
                    aria-label={`${g.label} 크게 보기`}
                  >
                    <img src={g.src} alt="" loading="lazy" className="h-full w-full object-cover object-left-top" />
                    <span className="absolute inset-x-3 bottom-3 rounded-full bg-black/70 px-3 py-1.5 text-left text-[11px] text-white/85 backdrop-blur">{g.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <Lightbox item={zoom} onClose={() => setZoom(null)} />
    </section>
  );
}

function Lightbox({ item, onClose }: { item: { src: string; label: string } | null; onClose: () => void }) {
  useEffect(() => {
    if (!item) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [item, onClose]);
  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div
          className="theme-d fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={item.label}
        >
          <motion.figure initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }} transition={{ duration: 0.45, ease: EASE }} className="max-w-[min(1100px,100%)]">
            <img src={item.src} alt={item.label} className="max-h-[78vh] w-auto rounded-2xl border border-[var(--d-stroke)]" />
            <figcaption className="mt-4 flex items-center justify-between gap-4 text-sm text-[var(--d-muted)]">
              <span>{item.label}</span>
              <span className="text-xs tracking-[0.1em]">Esc 또는 클릭으로 닫기</span>
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* --------------------------------------------------------------- stats */
const COMMITS = workflowByMonth.reduce((s, m) => s + m.backend + m.frontend + m.infra + m.ai, 0);
const STATS = [
  { value: cases.length, suffix: "개", label: "대표 사례", note: "설계부터 운영 확인까지 맡은 사례" },
  { value: 7, suffix: "개월", label: "실무 기간", note: `백엔드 실무 · ${profile.since} 현재` },
  { value: COMMITS, suffix: "개", label: "커밋", note: "merge 제외 · 생산성 지표가 아닌 규모 참고" },
];
function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {v}
      {suffix && <span className="ko-display ml-1 text-[0.32em] text-[var(--d-muted)]">{suffix}</span>}
    </span>
  );
}
function Stats() {
  return (
    <section className="bg-[var(--d-bg)] py-16 md:py-24">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-6 md:grid-cols-3 md:gap-6 md:px-10 lg:px-16">
        {STATS.map((s) => (
          <div key={s.label} className="border-t border-[var(--d-stroke)] pt-8">
            <p className="font-d-display text-7xl italic leading-none md:text-8xl">
              <Counter to={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-5 text-sm font-medium tracking-[0.05em] text-[var(--d-text)]/85">{s.label}</p>
            <p className="mt-2 text-sm text-[var(--d-muted)]">{s.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------- personal builds */
function Builds() {
  return (
    <section className="bg-[var(--d-bg)] py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <SectionHeader eyebrow="개인 작업" title="개인" accent="프로젝트" sub="업무 밖에서 만든 프로젝트와, 손에 익은 도구들." />
        <div className="grid gap-5 md:grid-cols-3">
          {sideProjects.map((p, i) => (
            <motion.article
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
              className="flex flex-col rounded-3xl border border-[var(--d-stroke)] bg-[var(--d-surface)] p-6 md:p-7"
            >
              <p className="text-xs tracking-[0.1em] text-[var(--d-muted)]">{p.kind}</p>
              <h3 className="mt-3 text-xl leading-snug">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--d-muted)]">{p.summary}</p>
              <ul className="mt-5 space-y-2.5 text-[13.5px] leading-relaxed text-[var(--d-text)]/85">
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-3">
                    <span className="accent-gradient mt-[9px] h-1 w-1 shrink-0 rounded-full" />
                    {pt}
                  </li>
                ))}
              </ul>
              <p className="mt-auto border-t border-[var(--d-stroke)] pt-4 text-xs leading-relaxed text-[var(--d-muted)] [margin-top:max(1.5rem,auto)]">{p.stack.join(" · ")}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-16 divide-y divide-[var(--d-stroke)] border-y border-[var(--d-stroke)]">
          {stack.map((g) => (
            <div key={g.group} className="grid gap-2 py-5 md:grid-cols-[200px_1fr] md:gap-6">
              <span className="text-xs tracking-[0.1em] text-[var(--d-muted)]">{g.group}</span>
              <p className="text-sm leading-relaxed text-[var(--d-text)]/90 md:text-base">{g.items.join(" · ")}</p>
            </div>
          ))}
          <div className="grid gap-2 py-5 md:grid-cols-[200px_1fr] md:gap-6">
            <span className="text-xs tracking-[0.1em] text-[var(--d-muted)]">학력 · 자격</span>
            <div className="space-y-1">
              {education.map((e) => (
                <p key={e.label} className="text-sm text-[var(--d-text)]/90 md:text-base">
                  {e.label} <span className="ml-2 text-xs text-[var(--d-muted)]">{e.meta}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- contact */
function Contact() {
  const track = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  useEffect(() => {
    if (still || !track.current) return;
    const tw = gsap.to(track.current, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
    return () => {
      tw.kill();
    };
  }, [still]);
  const phrase = "버티는 구조를 만듭니다 • ";
  return (
    <section id="contact" className="relative overflow-hidden bg-[var(--d-bg)] pb-8 pt-16 md:pb-12 md:pt-20">
      <HlsVideo flip />
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--d-bg)] to-transparent" />

      <div className="relative z-10">
        <div className="overflow-hidden py-6" aria-hidden>
          <div ref={track} className="flex w-max whitespace-nowrap">
            {[0, 1].map((half) => (
              <span key={half} className="ko-display pr-0 text-6xl text-[var(--d-text)]/90 md:text-8xl lg:text-9xl">
                {Array.from({ length: 10 }, () => phrase).join("")}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-14 flex max-w-[1200px] flex-col items-center px-6 text-center md:mt-20 md:px-10 lg:px-16">
          <p className="text-xs tracking-[0.3em] text-[var(--d-muted)]">연락</p>
          <h2 className="ko-display mt-5 text-4xl md:text-6xl">
            무엇이 <span className="accent-text">깨지는지</span>,
            <br /> 어떻게 버티는지 이야기해요.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--d-muted)] md:text-base">백엔드, 배포 구조, 외부 연동의 실패 설계에 관한 이야기라면 언제든 환영합니다.</p>
          <div className="mt-10">
            <GradientButton href={`mailto:${profile.email}`} solid>
              {profile.email} ↗
            </GradientButton>
          </div>
        </div>

        <footer className="mx-auto mt-24 flex max-w-[1200px] flex-col gap-6 border-t border-white/10 px-6 pt-8 text-sm text-[var(--d-muted)] md:flex-row md:items-center md:justify-between md:px-10 lg:px-16">
          <div className="flex flex-wrap gap-6">
            <a href={profile.github} target="_blank" rel="noreferrer" className="transition-colors hover:text-[var(--d-text)]">
              GitHub
            </a>
            <a href={`mailto:${profile.email}`} className="transition-colors hover:text-[var(--d-text)]">
              이메일
            </a>
            <a href="/" className="transition-colors hover:text-[var(--d-text)]">
              다른 시안
            </a>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="animate-d-pulse h-2 w-2 rounded-full bg-green-400" />
            <span>대화 환영</span>
          </div>
          <p className="text-xs">
            © 2026 {profile.name} · Inter, Instrument Serif (OFL) · GSAP · Motion · hls.js
          </p>
        </footer>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- overlay */
function CaseOverlay({ c, onClose, onNavigate }: { c: CaseStudy | null; onClose: () => void; onNavigate: (c: CaseStudy) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!c) return;
    const back = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 50);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      back?.focus({ preventScroll: true });
    };
  }, [!!c, onClose]); // eslint-disable-line react-hooks/exhaustive-deps
  const S = c;
  const SDemo = c ? DEMOS[c.demo] : null;
  const sIdx = c ? cases.findIndex((x) => x.id === c.id) : -1;
  const go = (d: number) => onNavigate(cases[(sIdx + d + cases.length) % cases.length]);

  return createPortal(
    <AnimatePresence>
      {S && SDemo && (
        <motion.div key="ov" className="theme-d fixed inset-0 z-[80]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={S.title}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="absolute inset-3 overflow-y-auto overscroll-contain rounded-3xl border border-[var(--d-stroke)] bg-[var(--d-bg)] md:inset-8"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--d-stroke)] bg-[var(--d-bg)]/85 px-5 py-4 backdrop-blur-md md:px-10">
              <span className="text-xs tracking-[0.15em] text-[var(--d-muted)]">
                사례 0{sIdx + 1} / 0{cases.length}
              </span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => go(-1)} className="rounded-full border border-[var(--d-stroke)] px-3 py-1.5 text-sm text-[var(--d-muted)] hover:text-[var(--d-text)]" aria-label="이전 사례">
                  ←
                </button>
                <button type="button" onClick={() => go(1)} className="rounded-full border border-[var(--d-stroke)] px-3 py-1.5 text-sm text-[var(--d-muted)] hover:text-[var(--d-text)]" aria-label="다음 사례">
                  →
                </button>
                <button ref={closeRef} type="button" onClick={onClose} className="rounded-full bg-[var(--d-text)] px-4 py-1.5 text-sm text-[var(--d-bg)]">
                  닫기
                </button>
              </div>
            </div>
            <div key={S.id} className="grid gap-10 px-5 pb-14 pt-8 md:px-10 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className="text-xs tracking-[0.1em] text-[var(--d-muted)]">
                  {S.area} · {S.period}
                </p>
                <h3 className="mt-4 text-3xl leading-[1.15] tracking-tight md:text-4xl">{S.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-[var(--d-text)]/80">{S.tagline}</p>
                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                  <span className={`rounded-full px-3 py-1 ${S.status.kind === "service" ? "accent-gradient text-[#0a0a0a]" : "border border-[var(--d-stroke)] text-[var(--d-text)]/85"}`}>{S.status.label}</span>
                  <span className="text-[var(--d-muted)]">{S.role}</span>
                </div>
                <dl className="mt-8 space-y-7 text-sm leading-relaxed">
                  <Field k="문제">{S.problem}</Field>
                  <Field k="결정">
                    <ol className="space-y-3">
                      {S.decisions.map((d, i) => (
                        <li key={d} className="flex gap-3">
                          <span className="font-d-display w-5 shrink-0 text-lg italic leading-none text-[#89aacc]">{i + 1}</span>
                          <span className="text-[var(--d-text)]/85">{d}</span>
                        </li>
                      ))}
                    </ol>
                  </Field>
                  <Field k="결과">{S.result}</Field>
                  <Field k="남은 과제">
                    <span className="text-[var(--d-muted)]">{S.limit}</span>
                  </Field>
                </dl>
                <div className="mt-7 flex flex-wrap gap-1.5">
                  {S.stack.map((s) => (
                    <span key={s} className="rounded-full border border-[var(--d-stroke)] px-3 py-1 text-[11px] text-[var(--d-muted)]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="lg:sticky lg:top-24 lg:self-start">
                <SDemo />
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
      <dt className="mb-2 text-xs font-medium tracking-[0.1em] text-[var(--d-muted)]">{k}</dt>
      <dd className="text-[var(--d-text)]/85">{children}</dd>
    </div>
  );
}
