import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLayoutEffect } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { animate, splitText, stagger } from "animejs";
import type { CaseStatus } from "@/data/content";

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const FADE_EASE = [0.25, 0.1, 0.25, 1] as const; // from the brief

/* ------------------------------------------------------------------ FadeIn */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  as = "div",
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  as?: "div" | "li" | "nav" | "section" | "p" | "span";
  className?: string;
}) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{ duration, delay, ease: FADE_EASE }}
    >
      {children}
    </Comp>
  );
}
export const Reveal = FadeIn;

/* ------------------------------------------------------------------ Magnet */
export function Magnet({
  children,
  padding = 150,
  strength = 3,
  className,
}: {
  children: ReactNode;
  padding?: number;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, active: false });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const inside =
        e.clientX > r.left - padding && e.clientX < r.right + padding && e.clientY > r.top - padding && e.clientY < r.bottom + padding;
      if (inside) {
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        setPos({ x: (e.clientX - cx) / strength, y: (e.clientY - cy) / strength, active: true });
      } else {
        setPos((p) => (p.active ? { x: 0, y: 0, active: false } : p));
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [padding, strength, reduce]);

  return (
    <div ref={ref} className={className}>
      <div
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          transition: pos.active ? "transform 0.3s ease-out" : "transform 0.6s ease-in-out",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ AnimatedText */
export function AnimatedText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.2"] });
  const chars = Array.from(text);
  return (
    <p ref={ref} className={className}>
      {chars.map((c, i) => (
        <Char key={i} progress={scrollYProgress} range={[i / chars.length, (i + 1) / chars.length]}>
          {c}
        </Char>
      ))}
    </p>
  );
}
function Char({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <span className="relative">
      <span className="invisible">{children}</span>
      <motion.span className="absolute left-0 top-0" style={{ opacity }}>
        {children}
      </motion.span>
    </span>
  );
}

/* ------------------------------------------------------------------ Sheet */
/** A section that rises over the previous one: 60px top radius, pulled up, and scaling
 *  from 0.93 → 1 while its top edge travels from the bottom of the viewport to the top. */
export function Sheet({
  children,
  tone = "dark",
  id,
  className = "",
  z = 10,
}: {
  children: ReactNode;
  tone?: "dark" | "light";
  id?: string;
  className?: string;
  z?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0.93, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [60, 36]);
  return (
    <motion.section
      ref={ref}
      id={id}
      style={{ scale, borderTopLeftRadius: radius, borderTopRightRadius: radius, zIndex: z, transformOrigin: "50% 0%" }}
      className={`relative -mt-10 sm:-mt-12 md:-mt-14 ${
        tone === "light" ? "bg-white text-[#0C0C0C]" : "bg-[#0C0C0C] text-ink"
      } shadow-[0_-30px_60px_-20px_rgba(0,0,0,0.55)] ${className}`}
    >
      {children}
    </motion.section>
  );
}

/* --------------------------------------------------------------- Headings */
export function BigHeading({ children, tone = "dark", className = "" }: { children: ReactNode; tone?: "dark" | "light"; className?: string }) {
  return (
    <FadeIn y={40}>
      <h2
        className={`text-center font-black leading-[1.1] tracking-[-0.04em] ${tone === "light" ? "text-[#0C0C0C]" : "hero-heading"} ${className}`}
        style={{ fontSize: "clamp(2.6rem, 10vw, 140px)" }}
      >
        {children}
      </h2>
    </FadeIn>
  );
}

/** Big gradient heading whose letters rise from the centre outwards on first view (anime.js). */
export function AnimeHeading({ children }: { children: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduce = useReducedMotion();
  const seen = useInView(ref, { once: true, amount: 0.5 });
  useLayoutEffect(() => {
    if (!ref.current || reduce) return;
    const split = splitText(ref.current, { chars: { class: "ach" } });
    split.chars.forEach((c: HTMLElement) => {
      c.style.opacity = "0";
      c.style.transform = "translateY(0.5em) rotate(8deg)";
    });
    return () => {
      split.revert();
    };
  }, [reduce]);
  useLayoutEffect(() => {
    if (!seen || reduce || !ref.current) return;
    const a = animate(ref.current.querySelectorAll(".ach"), {
      y: ["0.5em", "0em"],
      rotate: [8, 0],
      opacity: [0, 1],
      delay: stagger(45, { from: "center" }),
      duration: 1100,
      ease: "outExpo",
    });
    return () => {
      a.pause();
    };
  }, [seen, reduce]);
  return (
    <h2
      ref={ref}
      className="hero-heading text-center font-black leading-[1.1] tracking-[-0.04em] [&_.ach]:inline-block [&_.ach]:bg-[linear-gradient(180deg,#646973_0%,#BBCCD7_100%)] [&_.ach]:bg-clip-text"
      style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
    >
      {children}
    </h2>
  );
}

/* ---------------------------------------------------------------- Buttons */
export function ContactButton({ href = "#contact", label = "연락하기", onClick }: { href?: string; label?: string; onClick?: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="pill-gradient press inline-flex items-center rounded-full px-8 py-3 text-xs font-medium uppercase tracking-widest text-white hover:brightness-110 sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4 md:text-base"
    >
      {label}
    </a>
  );
}

export function GhostButton({ children, onClick, href, tone = "dark" }: { children: ReactNode; onClick?: () => void; href?: string; tone?: "dark" | "light" }) {
  const cls = `press inline-flex items-center gap-2 rounded-full border-2 px-6 py-2.5 text-xs font-medium uppercase tracking-widest sm:px-8 sm:py-3 sm:text-sm ${
    tone === "light" ? "border-[#0C0C0C] text-[#0C0C0C] hover:bg-[#0C0C0C]/10" : "border-[#D7E2EA] text-[#D7E2EA] hover:bg-[#D7E2EA]/10"
  }`;
  if (href)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    );
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ Chips */
const STATUS_STYLE: Record<CaseStatus, string> = {
  integrated: "border border-[#D7E2EA]/40 text-[#D7E2EA]",
  service: "pill-gradient text-white",
  local: "border border-warn/60 text-warn",
  joint: "border border-info/60 text-info",
};
export function StatusChip({ kind, label }: { kind: CaseStatus; label: string }) {
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium ${STATUS_STYLE[kind]}`}>{label}</span>;
}

export function Tag({ children, tone = "dark" }: { children: ReactNode; tone?: "dark" | "light" }) {
  return (
    <span className={`rounded-full border px-3 py-1 text-[12px] ${tone === "light" ? "border-[#0C0C0C]/20 text-[#0C0C0C]/70" : "border-[#D7E2EA]/20 text-muted"}`}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------- Demo frame */
export function DemoFrame({ title, hint, children, controls }: { title: string; hint?: string; children: ReactNode; controls?: ReactNode }) {
  return (
    <div className="demo overflow-hidden rounded-[28px] border border-[#D7E2EA]/15 bg-[#121314]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D7E2EA]/10 px-5 py-3.5">
        <span className="flex items-center gap-2 text-[12px] tracking-wide text-muted">
          <span className="h-2 w-2 rounded-full" style={{ background: "linear-gradient(135deg,#B600A8,#BE4C00)" }} />
          {title}
        </span>
        {controls && <div className="flex flex-wrap items-center gap-2">{controls}</div>}
      </div>
      <div className="relative p-4 sm:p-6">{children}</div>
      {hint && <div className="border-t border-[#D7E2EA]/10 px-5 py-3.5 text-[12.5px] leading-[1.65] text-muted">{hint}</div>}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  active,
  disabled,
  tone = "default",
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  tone?: "default" | "signal";
}) {
  const base = "press rounded-full px-3.5 py-1.5 text-[12px] font-medium tracking-wide disabled:opacity-40 disabled:pointer-events-none";
  const style =
    tone === "signal"
      ? "pill-gradient text-white"
      : active
        ? "bg-[#D7E2EA] text-[#0C0C0C]"
        : "border border-[#D7E2EA]/25 text-ink-2 hover:border-[#D7E2EA]/60 hover:text-ink";
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${style}`} aria-pressed={active}>
      {children}
    </button>
  );
}
