import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Btn, DemoFrame, EASE_OUT } from "@/components/ui";
import { Mark } from "@/components/icons";
import { useNeutral } from "./copy";

const STAGES = [
  { key: "select", name: "대상 선정", detail: "사업장 · 귀속기간 · 신고 유형" },
  { key: "build", name: "레코드 빌더", detail: "유형별 규격(급여 · 사업 · 일용 · 부가세)" },
  { key: "assemble", name: "조립", detail: "헤더 · 본문 · 합계 레코드" },
  { key: "charset", name: "문자셋", detail: "CP949 인코딩 가능 여부 판단" },
  { key: "encrypt", name: "암호화", detail: "batch 안의 파일을 건별 처리" },
  { key: "submit", name: "제출", detail: "외부 신고 시스템 업로드" },
  { key: "verify", name: "검증", detail: "결과 한 번 조회 후 병렬 확인" },
] as const;
/** Domain-neutral stage details for variants B, D, E. */
const NEUTRAL_DETAIL: Partial<Record<(typeof STAGES)[number]["key"], string>> = {
  select: "대상 · 기간 · 파일 유형",
  build: "유형별 고정 길이 레코드 규격",
  submit: "외부 시스템 업로드",
};

type Scenario = "plain" | "charset" | "partial";
type StageState = "idle" | "run" | "done" | "fallback" | "partial";

const SCENARIOS: { key: Scenario; label: string }[] = [
  { key: "plain", label: "일반 파일" },
  { key: "charset", label: "CP949 미지원 문자 포함" },
  { key: "partial", label: "3건 중 1건 실패" },
];

export function PipelineDemo() {
  const neutral = useNeutral();
  const [scenario, setScenario] = useState<Scenario>("charset");
  const [states, setStates] = useState<StageState[]>(STAGES.map(() => "idle"));
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);
  const box = useRef<HTMLOListElement>(null);
  const seen = useInView(box, { once: true, amount: 0.6 });
  useEffect(() => {
    if (seen) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen]);

  const run = () => {
    clear();
    setFinished(false);
    setRunning(true);
    setStates(STAGES.map(() => "idle"));
    let t = 0;
    STAGES.forEach((s, i) => {
      timers.current.push(window.setTimeout(() => setStates((p) => p.map((v, j) => (j === i ? "run" : v))), t));
      const slow = (scenario === "charset" && s.key === "charset") || (scenario === "partial" && s.key === "encrypt");
      t += slow ? 1500 : 520;
      const end: StageState =
        scenario === "charset" && s.key === "charset" ? "fallback" : scenario === "partial" && s.key === "encrypt" ? "partial" : "done";
      timers.current.push(window.setTimeout(() => setStates((p) => p.map((v, j) => (j === i ? end : v))), t));
    });
    timers.current.push(
      window.setTimeout(() => {
        setRunning(false);
        setFinished(true);
      }, t + 100),
    );
  };

  const pick = (s: Scenario) => {
    clear();
    setScenario(s);
    setRunning(false);
    setFinished(false);
    setStates(STAGES.map(() => "idle"));
  };

  return (
    <DemoFrame
      title={neutral ? "batch/file-orchestrator.run(job)" : "e-filing/orchestrator.run(batch)"}
      controls={
        <>
          {SCENARIOS.map((s) => (
            <Btn key={s.key} active={scenario === s.key} onClick={() => pick(s.key)}>
              {s.label}
            </Btn>
          ))}
          <Btn tone="signal" onClick={run} disabled={running}>
            {running ? "실행 중" : "실행"}
          </Btn>
        </>
      }
      hint="단계마다 책임이 하나라서, 실패도 그 단계 안에서 처리됩니다. 문자셋 문제는 인코딩 정책이, 건별 실패는 batch 결과 모델이 맡습니다."
    >
      <ol ref={box} className="relative space-y-1.5">
        {STAGES.map((s, i) => {
          const st = states[i];
          return (
            <li key={s.key} className="relative">
              <div
                className={`relative grid grid-cols-[28px_1fr_auto] items-center gap-3 overflow-hidden border px-3 py-2.5 transition-colors duration-300 ${
                  st === "run" ? "border-line-2 bg-canvas-3" : st === "fallback" || st === "partial" ? "border-warn/40 bg-warn/5" : st === "done" ? "border-line bg-canvas" : "border-line bg-transparent"
                }`}
              >
                {st === "run" && (
                  <motion.span
                    className="absolute inset-y-0 left-0 bg-ink/[0.04]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.2, ease: "linear" }}
                  />
                )}
                <span className="relative font-mono text-[11.5px] text-dim">{String(i + 1).padStart(2, "0")}</span>
                <div className="relative min-w-0">
                  <div className="text-[14.5px] font-medium text-ink">{s.name}</div>
                  <div className="truncate text-[12.5px] text-muted">{neutral ? NEUTRAL_DETAIL[s.key] ?? s.detail : s.detail}</div>
                </div>
                <div className="relative flex items-center">
                  <StageBadge st={st} />
                </div>
              </div>

              <AnimatePresence initial={false}>
                {s.key === "charset" && scenario === "charset" && st !== "idle" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE_OUT }}
                    className="overflow-hidden"
                  >
                    <div className="ml-10 mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[12px]">
                      <span className="border border-alert/50 px-2 py-1 text-alert">CP949 · 인코딩 불가</span>
                      <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="text-dim">
                        →
                      </motion.span>
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: st === "fallback" ? 1 : 0.35, x: 0 }}
                        transition={{ delay: 0.75 }}
                        className="border border-ok/50 px-2 py-1 text-ok"
                      >
                        X-WINDOWS-949 · 전환
                      </motion.span>
                    </div>
                  </motion.div>
                )}
                {s.key === "encrypt" && scenario === "partial" && st !== "idle" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE_OUT }}
                    className="overflow-hidden"
                  >
                    <div className="ml-10 mt-1.5 flex flex-wrap gap-2 font-mono text-[12px]">
                      {(neutral ? ["대상 1", "대상 2", "대상 3"] : ["사업장 1", "사업장 2", "사업장 3"]).map((n, k) => (
                        <motion.span
                          key={n}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.25 + k * 0.3, ease: EASE_OUT }}
                          className={` border px-2 py-1 ${k === 1 ? "border-alert/50 text-alert" : "border-ok/40 text-ok"}`}
                        >
                          {n} · {k === 1 ? "실패 기록" : "완료"}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="mt-4 border border-line bg-canvas px-4 py-3 text-[14px] leading-[1.6] text-ink-2"
          >
            {scenario === "plain" && "모든 단계 통과. 새 유형이 와도 바뀌는 건 레코드 빌더와 매퍼뿐입니다."}
            {scenario === "charset" && "문자 하나 때문에 batch 전체가 멈추지 않습니다. 전환은 모든 파일 유형이 같은 정책으로 공유합니다."}
            {scenario === "partial" && "2건 제출 · 1건 실패 사유 기록. 부분 실패를 전체 실패로 바꾸지 않고, 항목별 결과로 돌려줍니다."}
          </motion.div>
        )}
      </AnimatePresence>
    </DemoFrame>
  );
}

function StageBadge({ st }: { st: StageState }) {
  const map: Record<StageState, { text: string; cls: string }> = {
    idle: { text: "대기", cls: "text-dim" },
    run: { text: "처리 중", cls: "text-ink" },
    done: { text: "완료", cls: "text-ok" },
    fallback: { text: "전환 후 완료", cls: "text-warn" },
    partial: { text: "부분 완료", cls: "text-warn" },
  };
  const m = map[st];
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={st}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: EASE_OUT }}
        className={`inline-flex items-center gap-1.5 font-mono text-[12px] ${m.cls}`}
      >
        {st === "run" ? <Spinner /> : st === "idle" ? null : <Mark kind={st === "done" ? "ok" : "warn"} />}
        {m.text}
      </motion.span>
    </AnimatePresence>
  );
}

function Spinner() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className="animate-spin" style={{ animationDuration: "0.7s" }}>
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" fill="none" />
      <path d="M6 1.5a4.5 4.5 0 0 1 4.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
