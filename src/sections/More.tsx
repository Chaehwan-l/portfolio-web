import { otherWork, education, sideProjects, stack, type SideProject } from "@/data/content";
import { BigHeading, FadeIn, Sheet, Tag } from "@/components/ui";
import { StackingCards } from "@/sections/Cases";

const TAG_STYLE: Record<string, string> = {
  "공동 기여": "border-info/60 text-info",
  "개발 경험": "border-warn/60 text-warn",
  통합: "border-[#D7E2EA]/40 text-[#D7E2EA]",
  분석: "border-[#D7E2EA]/40 text-[#D7E2EA]",
};

/* ----------------------------------------------------------- Also shipped */
export function OtherWork() {
  return (
    <section className="relative z-[35] bg-[#0C0C0C] px-5 pb-28 pt-6 sm:px-8 md:px-10">
      <FadeIn y={20}>
        <div className="mx-auto mb-8 max-w-[1240px] text-[13px] font-medium uppercase tracking-[0.2em] text-[#D7E2EA]/55">그 밖의 작업</div>
      </FadeIn>
      <div className="mx-auto grid max-w-[1240px] gap-3 sm:grid-cols-2 lg:grid-flow-dense lg:grid-cols-4">
        {otherWork.map((w, i) => (
          <FadeIn
            key={w.title}
            delay={(i % 4) * 0.08}
            className={`group flex flex-col justify-between rounded-[32px] border border-[#D7E2EA]/12 bg-[#121314] p-6 transition-colors duration-500 hover:border-[#D7E2EA]/40 md:p-7 ${
              w.size === "wide" ? "lg:col-span-2" : ""
            } ${w.size === "tall" ? "lg:row-span-2" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="shrink-0 whitespace-nowrap font-black leading-none text-[#D7E2EA]/25 transition-colors duration-500 group-hover:text-[#D7E2EA]" style={{ fontSize: "clamp(2rem,3vw,44px)" }}>
                0{i + 1}
              </span>
              <span className={`rounded-full border px-3 py-1 text-[12px] ${TAG_STYLE[w.tag] ?? "border-[#D7E2EA]/30 text-[#D7E2EA]/70"}`}>{w.tag}</span>
            </div>
            <div className="mt-10">
              <h3 className="text-[19px] font-medium uppercase leading-snug text-[#D7E2EA]">{w.title}</h3>
              <p className="mt-3 text-[14px] font-light leading-relaxed text-[#D7E2EA]/65">{w.body}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Projects */
export function SideProjects() {
  return (
    <Sheet id="projects" z={50}>
      <div className="px-5 pb-[10vh] pt-20 sm:px-8 sm:pt-24 md:px-10 md:pt-32">
        <BigHeading>개인 프로젝트</BigHeading>
        <FadeIn y={20} delay={0.1}>
          <p className="mx-auto mt-8 max-w-[600px] text-center text-[15px] leading-relaxed text-[#D7E2EA]/70 md:text-[17px]">
            회사 밖에서 인증, 캐시, 비동기 ETL, 파일 업로드처럼 백엔드의 기본기를 하나씩 끝까지 밀어 본 프로젝트입니다.
          </p>
        </FadeIn>
        <div className="mx-auto mt-16 max-w-[1240px] md:mt-24">
          <StackingCards items={sideProjects} render={(p, i) => <ProjectCard p={p} i={i} />} />
        </div>
      </div>
    </Sheet>
  );
}

function ProjectCard({ p, i }: { p: SideProject; i: number }) {
  return (
    <div className="flex flex-col gap-5 md:gap-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-4 md:gap-6">
          <span className="shrink-0 whitespace-nowrap hero-heading font-black leading-none" style={{ fontSize: "clamp(3rem, 8vw, 120px)" }}>
            0{i + 1}
          </span>
          <div className="pb-1 md:pb-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#D7E2EA]/55 md:text-[13px]">{p.kind}</div>
            <h3 className="mt-1 text-[19px] font-medium leading-tight text-[#D7E2EA] sm:text-[24px] md:text-[30px]">{p.title}</h3>
          </div>
        </div>
        <div className="hidden flex-wrap justify-end gap-1.5 md:flex md:max-w-[40%]">
          {p.stack.slice(0, 5).map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[40%_1fr] md:gap-5">
        <div className="rounded-[28px] bg-[#16171a] p-5 sm:rounded-[36px] md:p-7">
          <p className="text-[14.5px] leading-relaxed text-[#D7E2EA] md:text-[16px]">{p.summary}</p>
          <ul className="mt-5 space-y-2.5">
            {p.points.map((pt) => (
              <li key={pt} className="grid grid-cols-[10px_1fr] gap-3 text-[13px] leading-relaxed text-[#D7E2EA]/70">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full" style={{ background: "linear-gradient(135deg,#B600A8,#BE4C00)" }} />
                {pt}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {p.troubles.slice(0, 2).map((t) => (
            <div key={t.title} className="rounded-[28px] border border-[#D7E2EA]/12 p-5 sm:rounded-[36px] md:p-6">
              <div className="text-[11px] uppercase tracking-[0.2em] text-[#D7E2EA]/50">문제 해결</div>
              <div className="mt-2 text-[15px] font-medium text-[#D7E2EA]">{t.title}</div>
              <p className="mt-3 text-[12.5px] leading-relaxed text-[#D7E2EA]/55">{t.cause}</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-[#D7E2EA]">→ {t.fix}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- Toolkit */
export function StackEdu() {
  return (
    <Sheet id="stack" tone="light" z={60}>
      <div className="px-5 py-20 sm:px-8 sm:py-24 md:px-10 md:py-32">
        <div className="mb-16 sm:mb-20 md:mb-28">
          <BigHeading tone="light">기술 스택</BigHeading>
        </div>
        <ul className="mx-auto max-w-5xl">
          {stack.map((g, i) => (
            <FadeIn key={g.group} as="li" delay={i * 0.1} className="flex items-start gap-6 border-b border-[rgba(12,12,12,0.15)] py-8 first:border-t sm:gap-10 sm:py-10">
              <span className="inline-block w-[1.5em] shrink-0 whitespace-nowrap font-black leading-none text-[#0C0C0C]" style={{ fontSize: "clamp(3rem, 10vw, 140px)" }}>
                0{i + 1}
              </span>
              <div className="pt-2 sm:pt-4">
                <div className="font-medium uppercase text-[#0C0C0C]" style={{ fontSize: "clamp(1.1rem, 2.2vw, 2.1rem)" }}>
                  {g.group}
                </div>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {g.items.map((it) => (
                    <li key={it} className="rounded-full border border-[#0C0C0C]/20 px-3.5 py-1.5 text-[13px] text-[#0C0C0C]/75 transition-colors hover:border-[#0C0C0C] hover:text-[#0C0C0C]">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </ul>

        <div className="mx-auto mt-20 max-w-5xl md:mt-28">
          <div className="mb-6 text-[13px] font-medium uppercase tracking-[0.2em] text-[#0C0C0C]/50">학력 · 자격</div>
          <div className="grid gap-3 sm:grid-cols-3">
            {education.map((e, i) => (
              <FadeIn key={e.label} delay={i * 0.08} className="rounded-[32px] bg-[#0C0C0C] p-6 text-[#D7E2EA] md:p-7">
                <div className="text-[16px] font-medium leading-snug">{e.label}</div>
                <div className="mt-2 text-[12.5px] text-[#D7E2EA]/55">{e.meta}</div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
