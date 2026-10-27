/* Adapted from VEYRA src/AppearanceMenu.tsx (MIT, Amir Mušić).
   Behaviour unchanged; headings and caption show the backend metaphor. */
import { Check, X } from 'lucide-react'
import { appearanceOptions, type AppearanceMode } from './appearance'

export default function AppearanceMenu({ mode, selected, loaded, unavailable, waiting, onSelect, onClose }: {
  mode: AppearanceMode; selected: string; loaded: Set<string>; unavailable: Set<string>; waiting: boolean
  onSelect: (id: string) => void; onClose: () => void
}) {
  const options = appearanceOptions[mode]
  const current = options.find(option => option.id === selected)!
  return <div className={`appearance-menu ${mode}`} id={`appearance-${mode}`} role="group" aria-label={mode === 'paint' ? '환경별 overlay' : '배포 경로'}>
    <div className="appearance-heading"><span>{mode === 'paint' ? '도장 · overlay' : '휠 · 배포 경로'}</span><button className="appearance-close" onClick={onClose} aria-label="닫고 원래 차량으로 되돌리기"><X size={16} strokeWidth={1.5}/></button></div>
    <div className="appearance-options">
      {options.map(option => <button key={option.id} className={`appearance-option ${option.id === selected ? 'selected' : ''}`} disabled={waiting || !loaded.has(option.image)} aria-label={`${option.label}${unavailable.has(option.image) ? ' — 사용할 수 없음' : ''}`} aria-pressed={option.id === selected} title={option.label} onClick={() => onSelect(option.id)}>
        {mode === 'paint' ? <span className="paint-chip" style={{ backgroundColor: option.color, color: option.id === 'graphite' ? '#fff' : '#111' }}>{option.id === selected && <Check size={14}/>}</span> : <span className="wheel-chip" style={{ backgroundImage: `url("${option.image}")` }}/>} 
      </button>)}
    </div>
    <div className="appearance-caption" aria-live="polite">{waiting ? '외관으로 돌아가는 중…' : current.label}<small>{unavailable.size ? '일부 옵션을 불러오지 못했습니다' : current.note}</small></div>
  </div>
}
