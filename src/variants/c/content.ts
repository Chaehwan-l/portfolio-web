/* Adapted from VEYRA src/content.ts (MIT, Amir Mušić).
   Coordinates, images and the dormant `optics`/`clips` entries are unchanged;
   copy is rewritten as a backend-as-vehicle metaphor. */
export type SystemId = 'battery' | 'drive' | 'optics'
export const systems = {
  battery: {
    index: '01', label: '상태 계층', category: '배터리 — 상태 · 비동기', title: '발밑에서\n버티는 상태.',
    short: '상태·비동기 계층 열어보기',
    description: '배터리는 에너지를 저장했다가 필요한 곳에 보냅니다. 업무 이벤트도 먼저 저장하고, 어느 서버·채널로든 전달합니다.',
    benefit: '사용자가 어느 서버에 연결돼 있든, 알림은 한 번 제때 도착합니다.',
    image: '/media/battery-blue.png', anchor: { x: 64, y: 72 },
    points: [
      { label: '이벤트 · 이력 저장', text: '이벤트를 먼저 영속화하고 표시 템플릿·전달 채널을 분리했습니다. 기록이 있어야 실패 지점을 추적합니다.', x: 31, y: 42 },
      { label: 'Redis Pub/Sub · RabbitMQ', text: '인스턴스 간 경계에 Redis Pub/Sub, 서비스 간 이벤트에 RabbitMQ. SSE가 어디에 붙어 있든 신호가 닿습니다.', x: 27, y: 55 },
      { label: '멱등성 · 처리 잠금', text: 'Redis 처리 잠금과 멱등 request ID로, 같은 이벤트가 두 번 와도 발송은 한 번입니다.', x: 49, y: 49 },
    ],
  },
  drive: {
    index: '02', label: '엔진', category: '엔진 — 도메인 코어', title: '실패를\n구조로.',
    short: '도메인 엔진 열어보기',
    description: '엔진은 연료를 회전으로 바꿉니다. 도메인 코어는 늦고 끊기는 외부 응답을 끝까지 가는 업무로 바꿉니다.',
    benefit: '외부 시스템이 흔들려도 업무는 단계별로 이어집니다.',
    image: '/media/drive-blue.png', anchor: { x: 25, y: 48 },
    points: [
      { label: '실행 컨텍스트', text: '조회 식별자와 실행 대리인 ID를 분리하고, 누구의 ID로 실행할지 resolver 한 곳에서 정합니다.', x: 32, y: 46 },
      { label: '전자신고 오케스트레이터', text: '선정 → 빌더 → 조립 → 문자셋 → 암호화 → 제출 → 검증. 유형별 복제 코드를 단계와 공통 흐름으로.', x: 24, y: 49 },
      { label: '문자셋 fallback · 부분 실패', text: 'CP949로 안 되면 X-WINDOWS-949로 전환하고, batch 전체가 아니라 실패한 건만 돌려줍니다.', x: 48, y: 51 },
    ],
  },
  optics: {
    index: '03', label: 'Advanced lenses', category: 'Light & optics', title: 'Light,\nshaped precisely.',
    short: 'Explore the headlamp optics',
    description: 'Inside this concept headlamp, an LED module produces light and a projection lens shapes it into a controlled beam.',
    benefit: 'Precise light distribution helps illuminate the road where it is needed.',
    image: '/media/lenses-blue.png', anchor: { x: 36, y: 60 },
    points: [
      { label: 'Projection lens', text: 'The optical lens directs the light into the designed beam pattern.', x: 32.9, y: 55.7 },
      { label: 'LED module', text: 'The light source sits behind the projection optics.', x: 50.3, y: 57.2 },
      { label: 'Heat sink', text: 'Metal fins dissipate heat from the light-source assembly.', x: 61.9, y: 56.3 },
    ],
  },
} as const
export const systemIds: SystemId[] = ['battery', 'drive', 'optics']
export type HotspotId = SystemId | 'wheels' | 'paint'
export const hotspots: { id: HotspotId; index: string; label: string; anchor: { x: number; y: number }; target: SystemId | null }[] = [
  ...(['battery', 'drive'] as const).map(id => ({ id, index: systems[id].index, label: systems[id].label, anchor: systems[id].anchor, target: id })),
  { id: 'paint', index: '03', label: '도장 — 환경별 overlay', anchor: { x: 55, y: 51 }, target: null },
  { id: 'wheels', index: '04', label: '휠 — 배포 경로', anchor: { x: 48, y: 71 }, target: null },
]

// Enable each pair only after first/last frames, crop and color have been checked.
export const clips: Record<SystemId, { forward: string; reverse: string; enabled: boolean }> = {
  battery: { forward: '/media/battery-forward.mp4', reverse: '/media/battery-reverse.mp4', enabled: false },
  drive: { forward: '/media/drive-forward.mp4', reverse: '/media/drive-reverse.mp4', enabled: false },
  optics: { forward: '/media/optics-forward.mp4', reverse: '/media/optics-reverse.mp4', enabled: false },
}
