import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Copy } from "lucide-react";
import { credits, profile } from "@/data/content";
import { AnimatedText, AnimeHeading, ContactButton, FadeIn, GhostButton, Sheet, EASE_OUT } from "@/components/ui";

export function Contact() {
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
    <Sheet id="contact" z={70}>
      <div className="flex min-h-[90vh] flex-col items-center justify-center gap-12 px-5 py-24 sm:px-8 md:px-10">
        <AnimeHeading>이야기해요</AnimeHeading>
        <AnimatedText
          text="백엔드를 중심으로, 외부 연동이 많고 운영 경계가 중요한 제품에 관심이 많습니다. 같이 만들 구조가 있다면 편하게 연락 주세요."
          className="max-w-[560px] text-center font-medium leading-relaxed text-[#D7E2EA]"
        />
        <FadeIn y={20} className="flex flex-wrap items-center justify-center gap-3">
          <ContactButton href={`mailto:${profile.email}`} label="메일 보내기" />
          <GhostButton onClick={copy}>
            <Copy className="h-4 w-4" strokeWidth={1.8} />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={copied ? "c" : "e"}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                className="normal-case tracking-normal"
              >
                {copied ? "복사했습니다" : profile.email}
              </motion.span>
            </AnimatePresence>
          </GhostButton>
          <GhostButton href={profile.github}>
            GitHub <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
          </GhostButton>
        </FadeIn>
      </div>
      <Footer />
    </Sheet>
  );
}

function Footer() {
  const [open, setOpen] = useState(false);
  return (
    <footer className="px-5 pb-10 sm:px-8 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#D7E2EA]/10 pt-6 text-[12px] uppercase tracking-wider text-[#D7E2EA]/55">
        <span>
          © 2026 {profile.name} · {profile.githubLabel}
        </span>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="uppercase tracking-wider hover:text-[#D7E2EA]">
          {open ? "출처 닫기" : "오픈소스 출처"}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="grid gap-x-10 gap-y-3 overflow-hidden pt-6 text-[12.5px] sm:grid-cols-2"
          >
            {credits.map((c) => (
              <li key={c.name} className="grid grid-cols-[1fr_auto] gap-3 border-b border-[#D7E2EA]/10 pb-3">
                <span>
                  <a href={c.url} target="_blank" rel="noreferrer" className="text-[#D7E2EA] hover:opacity-70">
                    {c.name}
                  </a>
                  <span className="block text-[#D7E2EA]/55">{c.use}</span>
                </span>
                <span className="text-[#D7E2EA]/55">{c.license}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </footer>
  );
}
