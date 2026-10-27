import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { ContactButton, FadeIn, Magnet } from "@/components/ui";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260813_115057_94c3699b-0fd1-4124-bcf3-3626bb8c1f77.mp4";

export const NAV = [
  { label: "소개", href: "#about" },
  { label: "사례", href: "#cases" },
  { label: "프로젝트", href: "#projects" },
  { label: "연락", href: "#contact" },
];

/** Scales one line of text so it exactly fills its container's width. */
function FitLine({ text, className }: { text: string; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<number | null>(null);
  useLayoutEffect(() => {
    const fit = () => {
      if (!wrap.current || !line.current) return;
      line.current.style.fontSize = "100px";
      const w = line.current.scrollWidth;
      const next = (wrap.current.clientWidth / w) * 100 * 0.995;
      line.current.style.fontSize = `${next}px`; // React may skip the update if the value is unchanged
      setSize(next);
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [text]);
  return (
    <div ref={wrap} className="w-full overflow-hidden">
      <span ref={line} className={`inline-block whitespace-nowrap ${className}`} style={{ fontSize: size ? `${size}px` : "14vw" }}>
        {text}
      </span>
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [videoOk, setVideoOk] = useState(true);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // as the next sheet slides over, the hero sinks and dims a little
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const fade = useTransform(scrollYProgress, [0, 0.9], [1, 0.35]);

  return (
    <section ref={ref} id="top" className="relative flex h-[100svh] min-h-[600px] flex-col overflow-x-clip bg-[#0C0C0C]">
      <motion.div style={{ y, opacity: fade }} className="relative flex h-full flex-col bg-[#0C0C0C]">
        <FadeIn y={-20} delay={0} as="nav" className="relative z-20 flex items-center justify-between px-6 pt-6 md:px-10 md:pt-8">
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="text-sm font-medium uppercase tracking-wider text-[#D7E2EA] transition-opacity duration-200 hover:opacity-70 md:text-lg lg:text-[1.4rem]"
            >
              {n.label}
            </a>
          ))}
        </FadeIn>

        <FadeIn y={40} delay={0.15} className="relative z-0 mt-6 px-4 sm:mt-6 md:mt-5 md:px-6">
          <h1 className="sr-only">임채환 — 백엔드 개발자 포트폴리오</h1>
          <div className="hidden sm:block">
            <FitLine text="안녕하세요, 임채환입니다" className="hero-heading font-black leading-[1.05] tracking-[-0.04em]" />
          </div>
          <div className="sm:hidden">
            <FitLine text="안녕하세요," className="hero-heading font-black leading-[1.05] tracking-[-0.04em]" />
            <FitLine text="임채환입니다" className="hero-heading font-black leading-[1.05] tracking-[-0.04em]" />
          </div>
        </FadeIn>

        {videoOk && (
          <FadeIn y={30} delay={0.6} className="absolute left-1/2 top-1/2 z-10 w-[190vw] mix-blend-screen max-w-[1100px] -translate-x-1/2 -translate-y-[38%] sm:top-auto sm:bottom-0 sm:w-[96vw] sm:translate-y-0">
            <Magnet padding={150} strength={3}>
              <video
                src={VIDEO_SRC}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onError={() => setVideoOk(false)}
                aria-hidden
                className="pointer-events-none h-auto w-full [mask-image:radial-gradient(ellipse_55%_60%_at_50%_50%,#000_55%,transparent_100%)]"
              />
            </Magnet>
          </FadeIn>
        )}

        <div className="relative z-20 mt-auto flex items-end justify-between gap-6 px-6 pb-7 sm:pb-8 md:px-10 md:pb-10">
          <FadeIn y={20} delay={0.35}>
            <p className="max-w-[170px] font-light uppercase leading-snug tracking-wide text-[#D7E2EA] sm:max-w-[240px] md:max-w-[300px]" style={{ fontSize: "clamp(0.75rem, 1.4vw, 1.5rem)" }}>
              실패가 잦은 외부 연동을 구조로 바꾸고, 운영 환경에 도착하는 순간까지 책임지는 백엔드 엔지니어
            </p>
          </FadeIn>
          <FadeIn y={20} delay={0.5}>
            <ContactButton />
          </FadeIn>
        </div>
      </motion.div>
    </section>
  );
}

/** Floating pill nav that appears once the hero has scrolled away. */
export function FloatingNav() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 0.85);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.2 }}
          className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#D7E2EA]/15 bg-[#0C0C0C]/80 p-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl"
        >
          <a href="#top" className="px-3 text-[13px] font-black uppercase tracking-tight text-[#D7E2EA] sm:px-4">
            임채환
          </a>
          {NAV.slice(0, 3).map((n) => (
            <a key={n.label} href={n.href} className="hidden rounded-full px-3.5 py-2 text-[12px] font-medium uppercase tracking-wider text-[#D7E2EA]/75 transition-colors hover:bg-[#D7E2EA]/10 hover:text-[#D7E2EA] sm:block">
              {n.label}
            </a>
          ))}
          <a href="#contact" className="pill-gradient rounded-full px-4 py-2 text-[12px] font-medium uppercase tracking-widest text-white">
            연락하기
          </a>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
