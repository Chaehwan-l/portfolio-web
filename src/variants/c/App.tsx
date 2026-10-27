/* Variant C — "Inside Out".
   The interactive vehicle scene is adapted from VEYRA v1.0.0
   (github.com/amirmushichge/veyra-interactive-car, MIT, Amir Mušić).
   Scene state machine, timings, guards, plane formula, hover playback and
   appearance logic are kept as in the release; only copy changed, plus a
   guard so Escape closes the case drawer first. Everything below the scene
   (spec sheet, drawer, logbook …) is portfolio code, not part of VEYRA. */
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowLeft, ArrowUpRight, Plus, X } from 'lucide-react'
import { systems, hotspots, type HotspotId, type SystemId } from './content'
import HoverVideo from './HoverVideo'
import AppearanceMenu from './AppearanceMenu'
import { appearanceOptions, baseExterior, canUseHotspot, type AppearanceMode } from './appearance'
import { Portfolio, CaseDrawer } from './Portfolio'
import type { CaseStudy } from '@/data/content'
import './veyra.css'

type Phase = 'overview' | 'entering' | 'detail' | 'returning'
const ROOT_IMAGE = '/media/exterior-polished.png'

export default function App() {
  const [phase, setPhase] = useState<Phase>('overview')
  const [selected, setSelected] = useState<SystemId>('battery')
  const [hovered, setHovered] = useState<HotspotId | null>(null)
  const [annotation, setAnnotation] = useState<number | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [reduced, setReduced] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [appearance, setAppearance] = useState<AppearanceMode | null>(null)
  const [appearancePinned, setAppearancePinned] = useState(false)
  const [appearanceClosing, setAppearanceClosing] = useState(false)
  const [optionId, setOptionId] = useState('silver')
  const [appearanceImage, setAppearanceImage] = useState(baseExterior)
  const [neutral, setNeutral] = useState(true)
  const [loadedOptions, setLoadedOptions] = useState(() => new Set([baseExterior]))
  const [failedOptions, setFailedOptions] = useState<Set<string>>(() => new Set())
  const [openCase, setOpenCase] = useState<CaseStudy | null>(null)
  const optionLoads = useRef(new Set<string>())
  const appearanceTimer = useRef<number>(undefined)
  const leaveTimer = useRef<number>(undefined)
  const appearanceButtons = useRef<Partial<Record<AppearanceMode, HTMLButtonElement | null>>>({})
  const suppressFocus = useRef(false)
  const lock = useRef(false)
  const request = useRef(0)
  const timer = useRef<number>(undefined)
  const revealTimer = useRef<number>(undefined)
  const stage = useRef<HTMLElement>(null)
  const [plane, setPlane] = useState<CSSProperties>({})
  const closeButton = useRef<HTMLButtonElement>(null)
  const entryButtons = useRef<Partial<Record<SystemId, HTMLButtonElement | null>>>({})
  const current = systems[selected]
  const busy = phase === 'entering' || phase === 'returning'

  useEffect(() => {
    document.title = '임채환 — 백엔드, 안쪽까지.'
  }, [])

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update(); media.addEventListener('change', update)
    return () => { media.removeEventListener('change', update); clearTimeout(timer.current); clearTimeout(revealTimer.current); clearTimeout(appearanceTimer.current); clearTimeout(leaveTimer.current); request.current++ }
  }, [])

  useEffect(() => {
    if (!appearance) return
    let cancelled = false
    const pending = appearanceOptions[appearance].filter(option => !optionLoads.current.has(option.image))
    pending.forEach(option => {
      optionLoads.current.add(option.image)
      const image = new Image()
      image.onload = () => { image.decode().then(() => {
        if (!cancelled) {
          setLoadedOptions(previous => new Set(previous).add(option.image))
          setFailedOptions(previous => { const next = new Set(previous); next.delete(option.image); return next })
        }
      }).catch(() => { if (!cancelled) setFailedOptions(previous => new Set(previous).add(option.image)) }) }
      image.onerror = () => { if (!cancelled) setFailedOptions(previous => new Set(previous).add(option.image)) }
      image.src = option.image
    })
    return () => { cancelled = true; pending.forEach(option => optionLoads.current.delete(option.image)) }
  }, [appearance])

  function openAppearance(mode: AppearanceMode) {
    if (phase !== 'overview' || !canUseHotspot(appearance, mode, appearanceClosing)) return
    clearTimeout(leaveTimer.current)
    setHovered(null)
    if (appearance === mode) return
    setAppearance(mode); setAppearancePinned(false)
    setOptionId(appearanceOptions[mode][0].id); setAppearanceImage(baseExterior)
  }

  function closeAppearance(restoreFocus = true) {
    if (!appearance || appearanceClosing) return
    const previousMode = appearance
    clearTimeout(leaveTimer.current)
    setAppearanceClosing(true); setHovered(null)
    appearanceTimer.current = window.setTimeout(() => {
      setAppearance(null); setAppearancePinned(false); setAppearanceClosing(false)
      setAppearanceImage(baseExterior)
      if (restoreFocus) {
        suppressFocus.current = true
        appearanceButtons.current[previousMode]?.focus({ preventScroll: true })
        suppressFocus.current = false
      }
    }, reduced ? 0 : 260)
  }

  function chooseAppearance(id: string) {
    if (!appearance || appearanceClosing || !neutral) return
    const option = appearanceOptions[appearance].find(item => item.id === id)
    if (!option || !loadedOptions.has(option.image)) return
    setAppearancePinned(true); setOptionId(id); setAppearanceImage(option.image)
  }

  useEffect(() => {
    const element = stage.current!
    const updatePlane = () => {
      const { width } = element.getBoundingClientRect()
      const mobile = width <= 900
      // Keep the frame, media and hotspots on one unchanged coordinate plane.
      // The shared width also aligns the masthead, title and supporting copy.
      const mediaHeight = Math.max(700, window.innerHeight) - (window.innerHeight <= 780 ? 64 : 76) - 164 - 88
      const w = mobile ? width - 40 : Math.min(width - 2 * Math.min(72, Math.max(24, width * .04)), mediaHeight * 1672 / 941)
      const h = w * 941 / 1672
      setPlane({ width: w, height: h, left: (width - w) / 2, top: mobile ? 132 : 88 })
    }
    const observer = new ResizeObserver(updatePlane)
    observer.observe(element)
    window.addEventListener('resize', updatePlane)
    return () => { observer.disconnect(); window.removeEventListener('resize', updatePlane) }
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([ROOT_IMAGE, systems.battery.image, systems.drive.image].map(source => new Promise<void>((resolve, reject) => {
      const image = new Image()
      image.onload = () => { image.decode().then(resolve, resolve) }
      image.onerror = reject
      image.src = source
    }))).then(() => { if (!cancelled) setReady(true) }).catch(() => { if (!cancelled) setError('이미지를 불러오지 못했습니다. 새로고침해 주세요.') })
    return () => { cancelled = true }
  }, [])

  function finish(returning: boolean, id = selected) {
    clearTimeout(timer.current)
    setPhase(returning ? 'overview' : 'detail')
    setDetailVisible(!returning)
    lock.current = false
    setTimeout(() => returning ? entryButtons.current[id]?.focus({ preventScroll: true }) : closeButton.current?.focus({ preventScroll: true }), 0)
  }

  function transition(id: SystemId, returning = false) {
    if (id === 'optics' || appearance || lock.current || !ready || (!returning && phase !== 'overview')) return
    lock.current = true
    const token = ++request.current
    setSelected(id); setHovered(null); setAnnotation(null); setError('')
    setPhase(returning ? 'returning' : 'entering')

    // Hover films stay separate from the existing click-to-detail crossfade.
    revealTimer.current = window.setTimeout(() => { if (request.current === token) setDetailVisible(!returning) }, reduced ? 0 : 350)
    timer.current = window.setTimeout(() => { if (request.current === token) finish(returning, id) }, reduced ? 0 : 1250)
  }

  function returnToCar() { if (phase === 'detail') void transition(selected, true) }
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (openCase) { setOpenCase(null); return } // portfolio drawer sits above the scene
      if (appearance) closeAppearance(); else returnToCar()
    }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  })

  return <div className="c-root" style={{ '--scene-width': typeof plane.width === 'number' ? `${plane.width}px` : undefined, '--scene-height': typeof plane.height === 'number' ? `${plane.height}px` : undefined } as CSSProperties}>
  <main className={`experience phase-${phase} ${reduced ? 'reduced' : ''}`} aria-busy={busy}>
    <header className="masthead">
      <a className="wordmark" href="/c/" aria-label="처음 화면으로">임채환</a>
      <span className="header-middle">백엔드 엔지니어링 스터디</span>
      <a className="concept-label" href="#spec">포트폴리오 2026 ↓</a>
    </header>

    <section ref={stage} className="stage" aria-label="백엔드 시스템 둘러보기">
      <div className="image-plane" style={{ ...plane, '--focus-x': `${current.anchor.x}%`, '--focus-y': `${current.anchor.y}%` } as CSSProperties}>
        <div className="media-envelope"><div className="exterior-envelope">
        <div className="car-visual"><img className="car-image" src={ROOT_IMAGE} alt="스튜디오에 놓인 은색 전기 콘셉트 세단" draggable={false}/><HoverVideo desired={!appearance && (hovered === 'drive' || hovered === 'battery') ? hovered : null} mode={phase} reduced={reduced} onNeutral={setNeutral}/><div className={`appearance-visual ${appearance && neutral && !appearanceClosing ? 'shown' : ''}`} aria-hidden="true"><img src={appearanceImage} alt="" draggable={false}/></div></div>
        </div><div className={`detail-visual ${detailVisible ? 'shown' : ''}`}><img className="detail-image" src={current.image} alt={`단면 일러스트 — ${current.label}`} draggable={false}/></div>
        </div>

        {phase === 'overview' && ready && hotspots.map(item => {
          const { id, target } = item
          const enabled = canUseHotspot(appearance, id, appearanceClosing)
          if (id === 'paint' || id === 'wheels') return <div key={id} className={`appearance-hotspot ${appearance === id ? 'expanded' : ''}`} style={{ '--anchor-x': `${item.anchor.x}%`, '--anchor-y': `${item.anchor.y}%` } as CSSProperties} onPointerEnter={() => openAppearance(id)} onPointerLeave={event => {
            if (!appearancePinned && !event.currentTarget.contains(document.activeElement)) leaveTimer.current = window.setTimeout(() => closeAppearance(false), 140)
          }} onBlur={event => {
            if (!appearancePinned && !event.currentTarget.contains(event.relatedTarget)) closeAppearance(false)
          }}>
            <button ref={node => { appearanceButtons.current[id] = node }} className={`hotspot ${appearance === id ? 'active' : ''}`} disabled={!enabled} onFocus={() => { if (!suppressFocus.current) openAppearance(id) }} onClick={() => {
              if (appearance === id && appearancePinned) closeAppearance()
              else { openAppearance(id); setAppearancePinned(true) }
            }} aria-expanded={appearance === id && !appearanceClosing} aria-controls={`appearance-${id}`} aria-label={item.label}>
              <span className="hotspot-ring">{appearance === id && appearancePinned ? <X size={14} strokeWidth={1.5}/> : <Plus size={14} strokeWidth={1.5}/>}</span>
              <span className="hotspot-label">{id === 'paint' ? '도장 · 환경별 overlay' : '휠 · 배포 경로'}</span>
            </button>
            {appearance === id && !appearanceClosing && <span className="menu-bridge" aria-hidden="true"/>}
            {appearance === id && !appearanceClosing && <AppearanceMenu mode={id} selected={optionId} loaded={loadedOptions} unavailable={failedOptions} waiting={!neutral} onSelect={chooseAppearance} onClose={() => closeAppearance()}/>}
          </div>
          return <button key={id} ref={node => { if (target) entryButtons.current[target] = node }} className={`hotspot ${hovered === id ? 'active' : ''}`} style={{ left: `${item.anchor.x}%`, top: `${item.anchor.y}%` }} disabled={!enabled} onPointerEnter={() => { if (enabled) setHovered(id) }} onPointerLeave={() => setHovered(null)} onFocus={() => { if (enabled) setHovered(id) }} onBlur={() => setHovered(null)} onClick={target ? () => void transition(target) : undefined} aria-label={target ? systems[target].short : item.label}>
            <span className="hotspot-ring"><Plus size={14} strokeWidth={1.5}/></span><span className="hotspot-label">{item.label}{target && <ArrowUpRight size={15}/>}</span>
          </button>
        })}
        {phase === 'detail' && current.points.map((point, i) => <button key={point.label} className={`annotation ${annotation === i ? 'open' : ''}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} aria-label={point.label} aria-expanded={annotation === i} onClick={() => setAnnotation(annotation === i ? null : i)}>
          <span>{String(i + 1).padStart(2, '0')}</span><span className="annotation-label">{point.label}</span>
        </button>)}
      </div>

      <div className={`intro ${phase !== 'overview' ? 'hide' : ''}`} aria-hidden={phase !== 'overview'}>
        <h1>백엔드, 안쪽까지.</h1><p className="intro-description"><span>겉모습 아래의 구조를 열어 봅니다.</span><span>점 하나를 골라 시작하세요.</span></p>
      </div>

      {phase !== 'overview' && <button ref={closeButton} className="back" onClick={returnToCar} disabled={busy} aria-label="차량으로 돌아가기"><ArrowLeft size={18}/><span>{phase === 'returning' ? '차량으로 돌아가는 중' : '차량으로 돌아가기'}</span><kbd>Esc</kbd></button>}

      <aside className={`detail-copy ${phase === 'detail' ? 'shown' : ''}`} aria-hidden={phase !== 'detail'}>
        <div className="detail-introduction">
        <p className="eyebrow">{current.category}</p><h2>{current.title.split('\n').map(line => <span key={line}>{line}</span>)}</h2>
        <p className="system-description">{current.description}</p>
        </div>
        <div className="detail-components">
        <div className="part-list">{current.points.map((point, i) => <button key={point.label} tabIndex={phase === 'detail' ? 0 : -1} className={annotation === i ? 'selected' : ''} onClick={() => setAnnotation(annotation === i ? null : i)} aria-expanded={annotation === i}>
          <span className="part-row"><small>{String(i+1).padStart(2,'0')}</small>{point.label}<Plus size={14}/></span>{annotation === i && <span className="part-description">{point.text}</span>}
        </button>)}</div>
        <div className="benefit"><span>사용자에게는</span><p>{current.benefit}</p></div>
        </div>
      </aside>
      {(busy || !ready) && <div className="transition-status"><span className="small-dot"/>{!ready ? '화면을 준비하는 중' : phase === 'returning' ? '외관으로 돌아가는 중' : `${current.label} 안으로`}</div>}
    </section>

    <footer className="scene-footer">
      <div className="feature-notes" aria-label="둘러보는 방법">
        <div className="feature-note"><h3>엔진 — 도메인 코어</h3><p>보닛을 열어 보세요. 흔들리는 외부 연동을 끝까지 가는 업무로 바꾸는 곳.</p></div>
        <div className="feature-note"><h3>배터리 — 상태 · 비동기</h3><p>차체 아래를 보세요. 이벤트를 저장하고 어느 서버로든 전달하는 층.</p></div>
        <div className="feature-note"><h3>도장 — 환경별 overlay</h3><p>다섯 가지 마감. 같은 base 위에 환경마다 다른 overlay.</p></div>
        <div className="feature-note"><h3>휠 — 배포 경로</h3><p>세 가지 도착 경로. GitOps, 금융존 LB, GPU 배치.</p></div>
      </div>
      <div className="footer-baseline"><span>임채환 — 백엔드 스터디</span><span>{phase === 'overview' ? '시스템을 열어 보거나, 아래로 내려 사양서를 보세요.' : '구조는 실제, 그림은 은유입니다.'}</span></div>
    </footer>
    <p className="sr-only" role="status" aria-live="polite">{busy ? `${current.label} ${phase === 'entering' ? '여는 중' : '닫는 중'}` : phase === 'detail' ? `${current.label} 화면. Esc를 누르면 돌아갑니다.` : '차량 전체 화면. 시스템을 고르세요.'}</p>
    {error && <div className="error-message" role="alert">{error}<button onClick={() => setError('')} aria-label="메시지 닫기"><X size={16}/></button></div>}
  </main>
  <Portfolio onOpen={setOpenCase} />
  <CaseDrawer study={openCase} onClose={() => setOpenCase(null)} reduced={reduced} />
  </div>
}
