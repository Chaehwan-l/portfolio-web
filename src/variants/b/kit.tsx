import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";

/* ------------------------------------------------------------------ motion */
export const blurIn = {
  initial: { filter: "blur(10px)", opacity: 0, y: 20 },
  animate: { filter: "blur(0px)", opacity: 1, y: 0 },
};
export const blurTransition = (delay = 0) => ({ duration: 0.8, ease: "easeOut" as const, delay });

/** Blur-in on mount (hero) — the shared initial/animate from the brief. */
export function BlurIn({ children, delay = 0, className, style }: { children: ReactNode; delay?: number; className?: string; style?: CSSProperties }) {
  return (
    <motion.div className={className} style={style} initial={blurIn.initial} animate={blurIn.animate} transition={blurTransition(delay)}>
      {children}
    </motion.div>
  );
}

/** Same blur-in, but triggered when scrolled into view (sections below the hero). */
export function BlurInView({ children, delay = 0, className, style }: { children: ReactNode; delay?: number; className?: string; style?: CSSProperties }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={blurIn.initial}
      whileInView={blurIn.animate}
      viewport={{ once: true, amount: 0.15 }}
      transition={blurTransition(delay)}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------------- BlurText */
export function BlurText({ text, className, delay = 0, justify = "center", as = "p" }: { text: string; className?: string; delay?: number; justify?: "center" | "flex-start"; as?: "p" | "h1" | "h2" }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const Tag = as;
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const lines = text.split("\n");
  let idx = 0;
  return (
    <Tag ref={ref} className={className} style={{ display: "flex", flexWrap: "wrap", justifyContent: justify, rowGap: "0.1em" }}>
      {lines.map((line, li) => (
        <span key={li} style={{ display: "flex", flexWrap: "wrap", justifyContent: justify, width: lines.length > 1 ? "100%" : undefined }}>
          {line.split(" ").map((w) => {
            const i = idx++;
            return (
              <Fragment key={`${w}-${i}`}>
              <motion.span
                style={{ display: "inline-block", marginRight: "0.28em" }}
                initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
                animate={inView ? { filter: "blur(0px)", opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.7, delay: delay + i * 0.1, ease: "easeOut" }}
              >
                {w}
              </motion.span>
              {" "}
              </Fragment>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}

/* ------------------------------------------------------------- FadingVideo */
/** Fades in on load and out ~0.55s before the end, so loops never show a hard cut. */
export function FadingVideo({ src, className, style }: { src: string | string[]; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLVideoElement>(null);
  const sources = Array.isArray(src) ? src : [src];
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let raf = 0;
    let fadingOut = false;
    const fade = (from: number, to: number, ms: number) => {
      cancelAnimationFrame(raf);
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / ms);
        v.style.opacity = String(from + (to - from) * t);
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const onLoaded = () => {
      fadingOut = false;
      fade(0, 1, 500);
    };
    const onTime = () => {
      if (!fadingOut && v.duration && v.duration - v.currentTime <= 0.55) {
        fadingOut = true;
        fade(Number(v.style.opacity || 1), 0, 550);
      }
    };
    const onEnded = () => {
      if (sources.length === 1) {
        v.currentTime = 0;
        void v.play();
        fadingOut = false;
        fade(0, 1, 500);
      } else {
        setIndex((i) => (i + 1) % sources.length);
      }
    };
    v.style.opacity = "0";
    v.addEventListener("loadeddata", onLoaded);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", onEnded);
    if (v.readyState >= 2) onLoaded();
    return () => {
      cancelAnimationFrame(raf);
      v.removeEventListener("loadeddata", onLoaded);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended", onEnded);
    };
  }, [index, sources.length]);

  if (failed) return null;
  return (
    <video
      ref={ref}
      key={sources[index]}
      src={sources[index]}
      className={className}
      style={{ opacity: 0, ...style }}
      autoPlay
      muted
      playsInline
      preload="auto"
      aria-hidden
      onError={() => setFailed(true)}
    />
  );
}

/* ------------------------------------------------------------------- icons */
type IconProps = { className?: string };
export const ArrowUpRight = ({ className = "h-4 w-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M7 17L17 7" />
    <path d="M7 7h10v10" />
  </svg>
);
export const Play = ({ className = "h-4 w-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <polygon points="6 4 20 12 6 20 6 4" />
  </svg>
);
export const ClockIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className} aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const LayersIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M12 3l9 5-9 5-9-5 9-5z" />
    <path d="M3 13l9 5 9-5" />
  </svg>
);
export const ServerIcon = ({ className = "h-5 w-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M4 4h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm0 9h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1zm3-6.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm0 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
  </svg>
);
export const CloudIcon = ({ className = "h-5 w-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
  </svg>
);
export const LightbulbIcon = ({ className = "h-5 w-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
  </svg>
);
