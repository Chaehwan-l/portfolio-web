/* Portfolio sections below the VEYRA scene. Written for this site (not part of VEYRA);
   styled with the same tokens: Space Grotesk 400, studio blue, acid accents, thin lines. */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { ArrowLeft, ArrowUpRight, Plus } from 'lucide-react'
import { cases, education, otherWork, principles, profile, sideProjects, stack, timeline, workflowByMonth, type CaseStudy } from '@/data/content'
import { casePreview } from '@/data/marquee'
import { DEMOS } from '@/sections/Cases'

const EASE = [0.22, 0.7, 0.25, 1] as const

/** Which part of the vehicle each case plays. */
const PART: Record<CaseStudy['demo'], { name: string; line: string }> = {
  agency: { name: '조향 장치', line: '누구의 손으로 운전하는가' },
  pipeline: { name: '구동계', line: '단계마다 힘을 넘겨주는 구동계' },
  fanout: { name: '전장 버스', line: '어느 좌석에서도 같은 신호' },
  gpu: { name: '시험 주행로', line: '도로 밖에서 하는 주행 시험' },
  https: { name: '차폐 배선', line: '엔진룸 밖으로 나가는 배선 교체' },
  chatbot: { name: '주행 보조', line: '보조는 하되, 핸들은 기존 시스템이' },
}

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const still = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={still ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

function Head({ index, title, aside, id }: { index: string; title: string; aside?: ReactNode; id?: string }) {
  return (
    <Reveal className="pf-head">
      <div>
        <p className="pf-eyebrow" id={id}><span className="small-dot" />{index}</p>
        <h2>{title}</h2>
      </div>
      {aside && <p className="pf-aside">{aside}</p>}
    </Reveal>
  )
}

/* ------------------------------------------------------------------ page */
export function Portfolio({ onOpen }: { onOpen: (c: CaseStudy) => void }) {
  return (
    <div className="pf">
      {/* Driver */}
      <section className="pf-section pf-driver" aria-labelledby="driver">
        <Head index="00 — 운전자" id="driver" title={`${profile.name}, 백엔드 엔지니어.`} aside={<>{profile.company} · {profile.companyDesc}<br />{profile.period}</>} />
        <div className="pf-driver-body">
          <Reveal><p className="pf-lede">{profile.headline.join(' ')}</p></Reveal>
          <Reveal delay={0.08}><p className="pf-body">{profile.intro}</p></Reveal>
        </div>
      </section>

      {/* Spec sheet */}
      <section className="pf-section" aria-labelledby="spec">
        <Head index="01 — 사양서" id="spec" title="열어 본 여섯 개의 시스템." aside="행을 열면 문제 · 결정 · 결과 · 남은 과제와 직접 만져 볼 수 있는 데모가 나옵니다." />
        <SpecList onOpen={onOpen} />
      </section>

      {/* Principles */}
      <section className="pf-section" aria-labelledby="rules">
        <Head index="02 — 주행 원칙" id="rules" title="이렇게 만듭니다." />
        <div className="pf-notes">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06} className="feature-note">
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Logbook */}
      <section className="pf-section" aria-labelledby="log">
        <Head index="03 — 운행 기록" id="log" title="도로 위의 7개월." aside="막대는 월별 내 커밋의 영역 분포입니다. 생산성 지표가 아니라, 일이 어디로 옮겨 갔는지를 보여 줍니다." />
        <Logbook />
      </section>

      {/* Other work */}
      <section className="pf-section" aria-labelledby="bench">
        <Head index="04 — 작업대 위의 부품" id="bench" title="작은 부품도 같은 기준으로." />
        <div className="pf-bench">
          {otherWork.map((w, i) => (
            <Reveal key={w.title} delay={(i % 3) * 0.06} className="pf-bench-item">
              <div className="pf-bench-top"><h3>{w.title}</h3><span className="pf-chip">{w.tag}</span></div>
              <p>{w.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Side projects */}
      <section className="pf-section" aria-labelledby="garage">
        <Head index="05 — 차고 밖에서" id="garage" title="개인 프로젝트." />
        <div className="pf-garage">
          {sideProjects.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06} className="pf-garage-item">
              <p className="pf-kind">{p.kind}</p>
              <h3>{p.title}</h3>
              <p className="pf-body">{p.summary}</p>
              <ul className="pf-points">
                {p.points.map((pt) => <li key={pt}>{pt}</li>)}
              </ul>
              <p className="pf-stackline">{p.stack.join(' · ')}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Parts list */}
      <section className="pf-section" aria-labelledby="parts">
        <Head index="06 — 부품 목록" id="parts" title="기술 스택." />
        <div className="pf-parts">
          {stack.map((g) => (
            <Reveal key={g.group} className="pf-parts-row">
              <span>{g.group}</span>
              <p>{g.items.join(' · ')}</p>
            </Reveal>
          ))}
          {education.map((e) => (
            <Reveal key={e.label} className="pf-parts-row">
              <span>학력 · 자격</span>
              <p>{e.label} <small>{e.meta}</small></p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="pf-section pf-contact" aria-labelledby="contact">
        <Reveal>
          <p className="pf-eyebrow" id="contact"><span className="small-dot" />07 — 연락</p>
          <h2 className="pf-big">함께<br />달려 볼까요.</h2>
        </Reveal>
        <Reveal delay={0.08} className="pf-contact-actions">
          <a className="back pf-cta" href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight size={16} /></a>
          <a className="pf-link" href={profile.github} target="_blank" rel="noreferrer">{profile.githubLabel}<ArrowUpRight size={15} /></a>
        </Reveal>
      </section>

      <footer className="pf-footer">
        <div className="footer-baseline">
          <span>임채환 — 백엔드, 안쪽까지.</span>
          <span>
            차량 장면 · 미디어: Amir Mušić의 <a href="https://github.com/amirmushichge/veyra-interactive-car" target="_blank" rel="noreferrer">VEYRA</a>(MIT)를 각색.
            {' '}Space Grotesk · Pretendard (OFL) · Motion (MIT) · lucide (ISC).
          </span>
        </div>
      </footer>
    </div>
  )
}

/* ------------------------------------------------------------- spec list */
function SpecList({ onOpen }: { onOpen: (c: CaseStudy) => void }) {
  const [hover, setHover] = useState<CaseStudy['demo'] | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 30, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 260, damping: 30, mass: 0.6 })
  const fine = useRef(true)
  useEffect(() => { fine.current = matchMedia('(hover: hover) and (pointer: fine)').matches }, [])

  return (
    <div className="spec-list" onPointerMove={(e) => { x.set(e.clientX); y.set(e.clientY) }} onPointerLeave={() => setHover(null)}>
      {cases.map((c, i) => (
        <Reveal key={c.id} delay={i * 0.04}>
          <button
            type="button"
            className="spec-row"
            onClick={() => onOpen(c)}
            onPointerEnter={() => fine.current && setHover(c.demo)}
            onFocus={() => setHover(null)}
            aria-haspopup="dialog"
          >
            <small className="spec-index">{String(i + 1).padStart(2, '0')}</small>
            <span className="spec-part"><b>{PART[c.demo].name}</b><span>{PART[c.demo].line}</span></span>
            <span className="spec-title"><b>{c.title}</b><span>{c.tagline}</span></span>
            <span className="spec-meta"><span>{c.area}</span><span>{c.period}</span></span>
            <span className={`pf-chip ${c.status.kind === 'service' ? 'acid' : ''}`}>{c.status.label}</span>
            <Plus className="spec-plus" size={16} />
          </button>
        </Reveal>
      ))}
      <AnimatePresence>
        {hover && casePreview[hover] && (
          <motion.div
            key="preview"
            className="spec-preview"
            style={{ left: sx, top: sy }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.24, ease: EASE }}
            aria-hidden
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img key={hover} src={casePreview[hover]} alt="" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* -------------------------------------------------------------- logbook */
const LANES = [
  { key: 'backend', label: '백엔드', color: '#ffffff' },
  { key: 'frontend', label: '프론트엔드', color: '#c3d3de' },
  { key: 'infra', label: '인프라', color: '#edff39' },
  { key: 'ai', label: 'AI', color: '#2b4a5d' },
] as const

function Logbook() {
  const max = Math.max(...workflowByMonth.map((m) => m.backend + m.frontend + m.infra + m.ai))
  return (
    <div className="pf-log">
      <div className="pf-legend" aria-hidden>
        {LANES.map((l) => <span key={l.key}><i style={{ background: l.color }} />{l.label}</span>)}
      </div>
      {timeline.map((t, i) => {
        const w = workflowByMonth[i]
        const total = w ? w.backend + w.frontend + w.infra + w.ai : 0
        return (
          <Reveal key={t.month} className="pf-log-row">
            <span className="pf-log-month">{t.month}</span>
            <div className="pf-log-items">
              {t.items.map((it) => <p key={it}>{it}</p>)}
            </div>
            {w && (
              <div className="pf-log-bar" role="img" aria-label={`${t.month} 커밋 ${total}개: ${LANES.map((l) => `${l.label} ${w[l.key]}`).join(', ')}`}>
                <motion.div
                  className="pf-log-fill"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(total / max) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: EASE, delay: 0.1 }}
                >
                  {LANES.map((l) => w[l.key] > 0 && <span key={l.key} style={{ flexGrow: w[l.key], background: l.color }} />)}
                </motion.div>
                <small>{total}</small>
              </div>
            )}
          </Reveal>
        )
      })}
    </div>
  )
}

/* --------------------------------------------------------------- drawer */
export function CaseDrawer({ study, onClose, reduced }: { study: CaseStudy | null; onClose: () => void; reduced: boolean }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!study) return
    returnTo.current = document.activeElement as HTMLElement | null
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 30)
    return () => {
      clearTimeout(t)
      document.body.style.overflow = prev
      returnTo.current?.focus({ preventScroll: true })
    }
  }, [study])

  const Demo = study ? DEMOS[study.demo] : null
  const d = reduced ? 0 : 0.5
  return (
    <AnimatePresence>
      {study && Demo && (
        <motion.div key="drawer" className="case-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: d * 0.6 }}>
          <div className="case-scrim" onClick={onClose} />
          <motion.aside
            className="case-drawer theme-c"
            role="dialog"
            aria-modal="true"
            aria-label={study.title}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: d, ease: [0.65, 0, 0.25, 1] }}
          >
            <div className="case-top">
              <button ref={closeRef} className="back case-back" onClick={onClose} aria-label="사례 닫기"><ArrowLeft size={18} /><span>사양서로 돌아가기</span><kbd>Esc</kbd></button>
              <span className="pf-chip">{PART[study.demo].name}</span>
            </div>
            <p className="eyebrow">{study.area} · {study.period} · {study.role}</p>
            <h2 className="case-title">{study.title}</h2>
            <p className="case-tagline">{study.tagline}</p>
            <div className="case-tags">
              <span className={`pf-chip ${study.status.kind === 'service' ? 'acid' : ''}`}>{study.status.label}</span>
              {study.stack.map((s) => <span key={s} className="pf-chip ghost">{s}</span>)}
            </div>

            <div className="case-demo"><Demo /></div>

            <dl className="case-fields">
              <div><dt>문제</dt><dd>{study.problem}</dd></div>
              <div>
                <dt>결정</dt>
                <dd>
                  <ol className="case-decisions">
                    {study.decisions.map((x, i) => <li key={x}><span>{String(i + 1).padStart(2, '0')}</span><p>{x}</p></li>)}
                  </ol>
                </dd>
              </div>
              <div><dt>결과</dt><dd>{study.result}</dd></div>
              <div><dt>남은 과제</dt><dd className="muted">{study.limit}</dd></div>
            </dl>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
