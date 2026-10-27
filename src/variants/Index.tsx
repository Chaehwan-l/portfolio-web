import { variants } from "./registry";

/** Lists every design draft so they can be compared side by side. */
export function VariantIndex() {
  return (
    <main className="min-h-screen bg-[#0b0b0c] px-6 py-16 text-[#e7e7e7] md:px-12" style={{ fontFamily: "Barlow, Pretendard, sans-serif" }}>
      <p className="text-sm text-white/50">포트폴리오 시안 목록</p>
      <h1 className="ko-display mt-2 text-4xl md:text-6xl">
        임채환 포트폴리오 시안
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">마음에 드는 시안을 고른 뒤 그 시안을 기반으로 고도화합니다. 각 시안은 /키/ 경로에서 독립적으로 동작합니다.</p>
      <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {variants.map((v) => (
          <li key={v.key}>
            <a
              href={`/${v.key}/`}
              className="group block rounded-3xl border border-white/10 p-6 transition-colors hover:border-white/40"
              style={{ background: v.theme.bg, color: v.theme.fg }}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-5xl italic" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  {v.key.toUpperCase()}
                </span>
                <span className="text-xs opacity-60 transition-transform group-hover:translate-x-1">/{v.key}/ →</span>
              </div>
              <div className="mt-6 text-lg font-medium">{v.title}</div>
              <p className="mt-2 text-sm leading-relaxed opacity-60">{v.brief}</p>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
