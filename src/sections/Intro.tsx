import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { principles } from "@/data/content";
import { marqueeTiles } from "@/data/marquee";
import { AnimatedText, BigHeading, ContactButton, FadeIn, Sheet } from "@/components/ui";

/* ------------------------------------------------------------------ Marquee */
export function Marquee() {
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const on = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      setOffset((window.scrollY - top + window.innerHeight) * 0.3);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  const half = Math.ceil(marqueeTiles.length / 2);
  const row1 = marqueeTiles.slice(0, half);
  const row2 = marqueeTiles.slice(half);

  return (
    <section ref={ref} aria-label="작업 화면 미리보기" className="relative z-[5] overflow-x-clip bg-[#0C0C0C] pb-10 pt-24 sm:pt-32 md:pt-40">
      <div className="flex flex-col gap-3">
        <Row tiles={row1} style={{ transform: `translateX(${offset - 200}px)` }} />
        <Row tiles={row2} style={{ transform: `translateX(${-(offset - 200)}px)` }} />
      </div>
    </section>
  );
}

function Row({ tiles, style }: { tiles: { src: string; label: string }[]; style: React.CSSProperties }) {
  const tripled = [...tiles, ...tiles, ...tiles];
  return (
    <div className="flex w-max gap-3" style={{ ...style, willChange: "transform" }}>
      {tripled.map((t, i) => (
        <figure key={i} className="relative h-[200px] w-[312px] shrink-0 overflow-hidden rounded-2xl border border-[#D7E2EA]/10 bg-[#121314] sm:h-[270px] sm:w-[420px]">
          <img src={t.src} alt={i < tiles.length ? t.label : ""} loading="lazy" className="h-full w-full object-cover object-top" />
          <figcaption className="absolute bottom-3 left-3 rounded-full bg-[#0C0C0C]/80 px-3 py-1 text-[11px] uppercase tracking-wider text-[#D7E2EA] backdrop-blur">
            {t.label}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------- About */
const FLOATERS = [
  { label: "Kotlin · Spring", sub: "도메인", pos: "top-[4%] left-[1%] sm:left-[2%] md:left-[4%]", x: -80, delay: 0.1, rot: -8 },
  { label: "Redis · MQ", sub: "비동기", pos: "bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%]", x: -80, delay: 0.25, rot: 6 },
  { label: "GitOps · GKE", sub: "런타임", pos: "top-[4%] right-[1%] sm:right-[2%] md:right-[4%]", x: 80, delay: 0.15, rot: 7 },
  { label: "A100 · RAG", sub: "AI", pos: "bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%]", x: 80, delay: 0.3, rot: -6 },
];

const ABOUT_TEXT =
  "세무·회계 자동화 서비스의 백엔드를 만들어 왔습니다. 홈택스·위하고처럼 늦고, 틀리고, 중간에 끊기는 외부 시스템을 단계와 상태로 나누고, 그 코드가 이미지와 GitOps, 네트워크를 지나 실제로 동작하는 곳까지 따라가 책임집니다. 함께 단단한 구조를 만들고 싶습니다.";

export function About() {
  return (
    <section id="about" className="relative z-[5] flex min-h-screen flex-col items-center justify-center overflow-x-clip bg-[#0C0C0C] px-5 py-20 sm:px-8 md:px-10">
      {FLOATERS.map((f, i) => (
        <FadeIn key={f.label} x={f.x} y={0} delay={f.delay} duration={0.9} className={`absolute ${f.pos} hidden sm:block`}>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
            style={{ rotate: f.rot }}
            className="relative w-[140px] rounded-[28px] border border-[#D7E2EA]/15 bg-gradient-to-br from-[#1b1c20] to-[#0f0f11] p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] md:w-[190px] md:p-5"
          >
            <div className="mb-6 h-10 w-10 rounded-2xl md:h-12 md:w-12" style={{ background: "linear-gradient(123deg,#18011F 7%,#B600A8 37%,#7621B0 72%,#BE4C00 100%)", boxShadow: "inset 4px 4px 12px #7721B1" }} />
            <div className="text-[15px] font-medium text-[#D7E2EA] md:text-[17px]">{f.label}</div>
            <div className="text-[11px] uppercase tracking-widest text-[#D7E2EA]/50">{f.sub}</div>
          </motion.div>
        </FadeIn>
      ))}

      <div className="relative z-10 flex flex-col items-center gap-16 sm:gap-20 md:gap-24">
        <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
          <BigHeading>소개</BigHeading>
          <AnimatedText
            text={ABOUT_TEXT}
            className="max-w-[600px] text-center font-medium leading-relaxed text-[#D7E2EA]"
          />
        </div>
        <FadeIn y={20}>
          <ContactButton />
        </FadeIn>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Approach */
export function Approach() {
  return (
    <Sheet tone="light" z={20}>
      <div className="px-5 py-20 sm:px-8 sm:py-24 md:px-10 md:py-32">
        <div className="mb-16 sm:mb-20 md:mb-28">
          <BigHeading tone="light">일하는 방식</BigHeading>
        </div>
        <ul className="mx-auto max-w-5xl">
          {principles.map((p, i) => (
            <FadeIn key={p.title} as="li" delay={i * 0.1} className="flex items-start gap-6 border-b border-[rgba(12,12,12,0.15)] py-8 first:border-t sm:gap-10 sm:py-10 md:py-12">
              <span className="inline-block w-[1.5em] shrink-0 whitespace-nowrap font-black leading-none text-[#0C0C0C]" style={{ fontSize: "clamp(3rem, 10vw, 140px)" }}>
                0{i + 1}
              </span>
              <div className="pt-2 sm:pt-4">
                <div className="font-medium uppercase text-[#0C0C0C]" style={{ fontSize: "clamp(1.1rem, 2.2vw, 2.1rem)" }}>
                  {p.title}
                </div>
                <p className="mt-2 max-w-2xl font-light leading-relaxed text-[#0C0C0C] opacity-60" style={{ fontSize: "clamp(0.9rem, 1.6vw, 1.2rem)" }}>
                  {p.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </ul>
      </div>
    </Sheet>
  );
}
