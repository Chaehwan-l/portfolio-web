/* Adapted from VEYRA src/appearance.ts (MIT, Amir Mušić) — same images and logic,
   options relabelled for the backend metaphor:
   Paint  = Kustomize overlays (one body, a different finish per environment)
   Wheels = delivery paths (where the code actually lands). */
export type AppearanceMode = 'paint' | 'wheels'
export const baseExterior = '/media/exterior-polished.png'
export type AppearanceOption = { id: string; label: string; note: string; image: string; color?: string }
export const appearanceOptions: Record<AppearanceMode, AppearanceOption[]> = {
  paint: [
    { id: 'silver', label: 'base', note: '모든 환경이 공유하는 공통 매니페스트', color: '#c9cfd2', image: baseExterior },
    { id: 'electric', label: 'dev overlay', note: '개발 환경 값만 위에 덮어씁니다', color: '#edff39', image: '/media/config/electric-green.png' },
    { id: 'lime', label: 'feature flag ON', note: '코드 배포와 동작 전환을 분리합니다', color: '#9fdc32', image: '/media/config/lime-green.png' },
    { id: 'sky', label: 'prod overlay', note: 'GitOps 환경변수가 앱 기본값보다 우선합니다', color: '#708fa2', image: '/media/config/sky-blue.png' },
    { id: 'graphite', label: 'rollback', note: '이전 이미지 digest로 되돌립니다', color: '#30363c', image: '/media/config/graphite.png' },
  ],
  wheels: [
    { id: 'original', label: 'GKE · Argo CD', note: '여러 Pod가 바퀴살처럼 함께 굴러갑니다', image: baseExterior },
    { id: 'aero', label: 'NCP 금융존 · HTTPS', note: '닫힌 망, LB 리스너와 NACL을 거칩니다', image: '/media/config/wheels-aero.png' },
    { id: 'forged', label: 'KT Cloud A100 · 배치', note: '운영과 분리된 GPU 평가 경로', image: '/media/config/wheels-forged.png' },
  ],
}

export function canUseHotspot(active: AppearanceMode | null, id: string, closing: boolean) {
  return !closing && (!active || active === id)
}
