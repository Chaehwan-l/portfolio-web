import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Btn, DemoFrame, EASE_OUT } from "@/components/ui";
import { useNeutral } from "./copy";
import { Mark } from "@/components/icons";
import { Ring, RingChart } from "@/vendor/bklit/charts";

const SNAPS = [1, 2, 3, 4];
const TOTAL = 600;
const CHECKPOINT = 100;

export function GpuDemo() {
  return (
    <div className="space-y-4">
      <SnapshotPanel />
      <CheckpointPanel />
      <ProvisionRate />
    </div>
  );
}

function SnapshotPanel() {
  const neutral = useNeutral();
  const [target, setTarget] = useState(3);
  const [leak, setLeak] = useState(false);
  const indexFrom = leak ? target : target - 1;

  return (
    <DemoFrame
      title="k3/teacher_eval --snapshot N"
      controls={
        <>
          <Btn active={!leak} onClick={() => setLeak(false)}>N-1 인덱스</Btn>
          <Btn active={leak} onClick={() => setLeak(true)}>N 인덱스(누수)</Btn>
        </>
      }
    >
      <div className="mb-3 text-[13px] text-muted">평가할 스냅샷을 고르세요.</div>
      <div className="grid grid-cols-4 gap-2">
        {SNAPS.map((s) => {
          const isTarget = s === target;
          const isIndex = s === indexFrom;
          const selectable = s >= 2;
          return (
            <button
              key={s}
              type="button"
              disabled={!selectable}
              onClick={() => setTarget(s)}
              className={`press relative border p-3 text-left transition-colors duration-200 disabled:cursor-default ${
                isTarget ? "border-ink/70 bg-ink/[0.06]" : isIndex ? "border-info/60 bg-info/10" : "border-line bg-canvas hover:border-line-2"
              }`}
            >
              <div className="font-mono text-[11px] text-dim">snapshot</div>
              <div className="text-[20px] font-medium tabular">{s}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {isIndex && <span className="bg-info/20 px-1.5 py-0.5 font-mono text-[10.5px] text-info">index</span>}
                {isTarget && <span className="bg-ink/15 px-1.5 py-0.5 font-mono text-[10.5px] text-ink">eval</span>}
              </div>
              <div className="mt-3 flex gap-[3px]" aria-hidden>
                {Array.from({ length: 10 }).map((_, i) => {
                  const changed = isTarget && i >= 7;
                  return (
                    <motion.i
                      key={i}
                      className="h-5 flex-1 rounded-[3px]"
                      animate={{ backgroundColor: changed ? "#ffffff" : s <= target ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.05)" }}
                      transition={{ duration: 0.3, delay: i * 0.02 }}
                    />
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={`${leak}-${target}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className={`mt-4 flex gap-2 text-[14px] leading-[1.6] ${leak ? "text-alert" : "text-ink-2"}`}
        >
          <span className={`mt-1 shrink-0 ${leak ? "text-alert" : "text-ok"}`}>
            <Mark kind={leak ? "fail" : "ok"} size={14} />
          </span>
          {leak
            ? `스냅샷 ${target}의 변경 행이 이미 인덱스에 들어 있어, Teacher가 정답을 ‘검색’하게 됩니다. 점수는 오르지만 의미가 없습니다.`
            : `스냅샷 ${target}에서 새로 생기거나 바뀐 행(흰색)만, 스냅샷 ${target - 1}로 만든 인덱스로 평가합니다. 같은 ${neutral ? "원본 행" : "전표"}가 기여한 패턴도 검색에서 제외합니다.`}
        </motion.p>
      </AnimatePresence>
    </DemoFrame>
  );
}

function CheckpointPanel() {
  const [done, setDone] = useState(0);
  const [saved, setSaved] = useState(0);
  const [state, setState] = useState<"idle" | "running" | "killed" | "complete">("idle");
  const [log, setLog] = useState<string[]>([]);
  const tick = useRef<number | null>(null);

  const stop = () => {
    if (tick.current) window.clearInterval(tick.current);
    tick.current = null;
  };
  useEffect(() => stop, []);

  const push = (line: string) => setLog((l) => [...l.slice(-3), line]);

  const start = (from: number) => {
    stop();
    setState("running");
    let cur = from;
    tick.current = window.setInterval(() => {
      cur = Math.min(TOTAL, cur + 6);
      setDone(cur);
      if (cur % CHECKPOINT === 0) {
        setSaved(cur);
        push(`checkpoint ${cur} / ${TOTAL} 저장`);
      }
      if (cur >= TOTAL) {
        stop();
        setState("complete");
        push("run 완료 · registry 갱신");
      }
    }, 40);
  };

  const kill = () => {
    stop();
    setState("killed");
    push(`세션 종료 · ${done}건 처리 중이었음`);
  };

  const resume = () => {
    push(`재시작 · 완료 키 ${saved}건 skip → ${saved + 1}부터`);
    setDone(saved);
    start(saved);
  };

  const reset = () => {
    stop();
    setDone(0);
    setSaved(0);
    setLog([]);
    setState("idle");
  };

  return (
    <DemoFrame
      title="kt-a100 · long-running inference"
      controls={
        <>
          {state === "idle" && <Btn tone="signal" onClick={() => start(0)}>실행</Btn>}
          {state === "running" && <Btn tone="signal" onClick={kill}>GPU 세션 종료</Btn>}
          {state === "killed" && <Btn tone="signal" onClick={resume}>새 세션에서 재시작</Btn>}
          {state !== "idle" && <Btn onClick={reset}>초기화</Btn>}
        </>
      }
      hint="세션은 언제든 끝날 수 있다고 가정합니다. 모델 캐시·인덱스·체크포인트는 영구 스토리지에, 계산만 휘발성 GPU에 둡니다."
    >
      <div className="relative h-3 overflow-hidden bg-canvas-3">
        <motion.div className="absolute inset-y-0 left-0 bg-ink/25" animate={{ width: `${(done / TOTAL) * 100}%` }} transition={{ duration: 0.08, ease: "linear" }} />
        <motion.div className="absolute inset-y-0 left-0 bg-ok" animate={{ width: `${(saved / TOTAL) * 100}%` }} transition={{ duration: 0.3, ease: EASE_OUT }} />
        {Array.from({ length: TOTAL / CHECKPOINT - 1 }).map((_, i) => (
          <span key={i} className="absolute inset-y-0 w-px bg-canvas" style={{ left: `${((i + 1) * CHECKPOINT * 100) / TOTAL}%` }} />
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[12px] text-muted tabular">
        <span>
          처리 {done} / {TOTAL}
        </span>
        <span className="text-ok">체크포인트 {saved}</span>
      </div>
      <div className="mt-4 min-h-[92px] border border-line bg-canvas p-3 font-mono text-[12px] leading-[1.8] text-ink-2">
        {log.length === 0 ? (
          <span className="text-dim">실행 후 중간에 세션을 종료해 보세요.</span>
        ) : (
          log.map((l, i) => (
            <motion.div key={`${l}-${i}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
              <span className="text-dim">› </span>
              {l}
            </motion.div>
          ))
        )}
      </div>
    </DemoFrame>
  );
}

function ProvisionRate() {
  return (
    <div className="grid items-center gap-5 border border-line bg-canvas-2 p-5 sm:grid-cols-[220px_1fr]">
      <div className="relative mx-auto h-[200px] w-[200px]">
        <RingChart
          data={[{ label: "추천 코드 제공", value: 815451, maxValue: 842845, color: "#c27bf0" }]}
          size={200}
          strokeWidth={14}
          baseInnerRadius={70}
        >
          <Ring index={0} />
        </RingChart>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[28px] font-medium tracking-[-0.02em] tabular">96.75%</div>
          <div className="text-[12px] text-muted">추천 코드 제공률</div>
        </div>
      </div>
      <div>
        <div className="text-[15px] font-medium">수치를 쓸 때는 분모와 의미를 같이 씁니다</div>
        <p className="mt-2 text-[14px] leading-[1.7] text-muted">
          안정화 export 표본 842,845건 중 815,451건에 유효한 추천 코드를 제공했습니다. 이건 <span className="text-ink-2">제공률</span>이지
          정확도나 무검토 자동처리율이 아닙니다. 과거 RAG 구간의 같은 집합에서는 94.86% → 95.09%(+0.23%p, 893건)였고, 이를 전체 기간의 개선률로
          확대하지 않습니다.
        </p>
      </div>
    </div>
  );
}
