import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Btn, DemoFrame, EASE_OUT } from "@/components/ui";
import { useNeutral } from "./copy";

type Scenario = "normal" | "staff" | "dup";
type Bubble = { who: "customer" | "ai" | "staff"; text: string };
type Log = { actor: string; text: string; tone?: "ok" | "warn" | "muted" };
type Step = { log?: Log; bubble?: Bubble };

const Q = "세금계산서 발행 기한이 언제까지인가요?";
const A = "공급한 달의 다음 달 10일까지 발행하시면 됩니다. 사업장 상황에 따라 달라질 수 있어 내일 오전 담당 세무사님이 이어서 확인드릴게요.";

/** Domain-neutral wording for variants B, D, E. */
const NEUTRAL: Record<string, string> = {
  [Q]: "환불 요청은 언제까지 할 수 있나요?",
  [A]: "결제일로부터 7일 이내에 요청하시면 됩니다. 상황에 따라 달라질 수 있어 내일 오전 담당자가 이어서 확인드릴게요.",
  "짧은 묶음 대기 + 고객 단위 처리 잠금": "짧은 묶음 대기 + 대화방 단위 처리 잠금",
  "승인 FAQ · 사업장 가이드 · 법령 근거로 답 계산": "승인 FAQ · 운영 가이드 · 정책 문서 근거로 답 계산",
  "안녕하세요, 담당 세무사입니다. 제가 바로 확인해 드릴게요.": "안녕하세요, 담당자입니다. 제가 바로 확인해 드릴게요.",
  "고객 채팅": "사용자 채팅",
  "담당 세무사": "담당자",
};

const SCRIPTS: Record<Scenario, Step[]> = {
  normal: [
    { bubble: { who: "customer", text: Q } },
    { log: { actor: "채팅 서버", text: "메시지 저장 완료 → 이벤트 발행" } },
    { log: { actor: "업무 백엔드", text: "영업시간 외 · 열린 일감 있음 · 담당자 응대 없음" } },
    { log: { actor: "Redis", text: "짧은 묶음 대기 + 고객 단위 처리 잠금" } },
    { log: { actor: "답변 서비스", text: "승인 FAQ · 사업장 가이드 · 법령 근거로 답 계산" } },
    { log: { actor: "업무 백엔드", text: "발송 직전 상태 재확인 · request ID 발급" } },
    { log: { actor: "발송 API", text: "AI 발화 표식과 함께 저장 · 발송", tone: "ok" }, bubble: { who: "ai", text: A } },
  ],
  staff: [
    { bubble: { who: "customer", text: Q } },
    { log: { actor: "채팅 서버", text: "메시지 저장 완료 → 이벤트 발행" } },
    { log: { actor: "업무 백엔드", text: "영업시간 외 · 열린 일감 있음 · 담당자 응대 없음" } },
    { log: { actor: "Redis", text: "짧은 묶음 대기 + 고객 단위 처리 잠금" } },
    { bubble: { who: "staff", text: "안녕하세요, 담당 세무사입니다. 제가 바로 확인해 드릴게요." } },
    { log: { actor: "답변 서비스", text: "승인 FAQ · 사업장 가이드 · 법령 근거로 답 계산" } },
    { log: { actor: "업무 백엔드", text: "발송 직전 재확인: 담당자 선응대 감지 → AI 발화 취소", tone: "warn" } },
  ],
  dup: [
    { bubble: { who: "customer", text: Q } },
    { log: { actor: "채팅 서버", text: "메시지 저장 완료 → 이벤트 발행" } },
    { log: { actor: "채팅 서버", text: "같은 이벤트 재전달(at-least-once)", tone: "muted" } },
    { log: { actor: "업무 백엔드", text: "처리 잠금 보유 중 → 두 번째 이벤트는 대기 후 합류" } },
    { log: { actor: "답변 서비스", text: "승인 FAQ · 사업장 가이드 · 법령 근거로 답 계산" } },
    { log: { actor: "업무 백엔드", text: "같은 request ID 재요청 → 발송 1회로 수렴", tone: "warn" } },
    { log: { actor: "발송 API", text: "AI 발화 1건 저장 · 발송", tone: "ok" }, bubble: { who: "ai", text: A } },
  ],
};

const LABEL: Record<Scenario, string> = { normal: "기본 흐름", staff: "담당자가 먼저 답함", dup: "이벤트 중복 전달" };

export function ChatbotDemo() {
  const neutral = useNeutral();
  const t = (s: string) => (neutral ? (NEUTRAL[s] ?? s) : s);
  const [scenario, setScenario] = useState<Scenario>("normal");
  const [n, setN] = useState(0);
  const timers = useRef<number[]>([]);
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { once: true, amount: 0.5 });

  const play = (s: Scenario) => {
    clear();
    setScenario(s);
    setN(0);
    SCRIPTS[s].forEach((_, i) => timers.current.push(window.setTimeout(() => setN(i + 1), 250 + i * 720)));
  };

  useEffect(() => {
    if (seen) play("normal");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen]);

  const steps = SCRIPTS[scenario].slice(0, n);
  const bubbles = steps.flatMap((s) => (s.bubble ? [s.bubble] : []));
  const logs = steps.flatMap((s) => (s.log ? [s.log] : []));
  const typing = n > 0 && n < SCRIPTS[scenario].length && scenario !== "staff" && n >= 4;

  return (
    <DemoFrame
      title="after-hours/auto-reply"
      controls={(Object.keys(SCRIPTS) as Scenario[]).map((s) => (
        <Btn key={s} active={scenario === s && n > 0} onClick={() => play(s)}>
          {LABEL[s]}
        </Btn>
      ))}
      hint="AI는 ‘무엇을 답할지’만 계산합니다. 보낼지 말지, 언제, 몇 번 보낼지는 업무 백엔드와 기존 발송 API가 결정합니다. 예시 대화입니다."
    >
      <div ref={box} className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* phone */}
        <div className="rounded-[22px] border border-line-2 bg-canvas p-3">
          <div className="mb-3 flex items-center justify-between px-1 font-mono text-[11px] text-dim">
            <span>{t("고객 채팅")}</span>
            <span>23:14</span>
          </div>
          <div className="flex min-h-[260px] flex-col gap-2">
            {bubbles.length === 0 && <div className="m-auto text-[13px] text-dim">시나리오를 선택하세요</div>}
            <AnimatePresence initial={false}>
              {bubbles.map((b, i) => (
                <motion.div
                  key={`${scenario}-${i}`}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                  className={`max-w-[88%] rounded-[18px] px-3.5 py-2.5 text-[13.5px] leading-[1.55] ${
                    b.who === "customer"
                      ? "self-end bg-ink text-canvas"
                      : b.who === "staff"
                        ? "self-start border border-info/40 bg-info/10 text-ink"
                        : "self-start border border-line-2 bg-canvas-3 text-ink"
                  }`}
                >
                  {b.who !== "customer" && (
                    <div className={`mb-1 font-mono text-[10.5px] ${b.who === "staff" ? "text-info" : "text-ok"}`}>{b.who === "staff" ? t("담당 세무사") : "AI 안내 · 영업시간 외"}</div>
                  )}
                  {t(b.text)}
                </motion.div>
              ))}
              {typing && (
                <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-1 self-start border border-line-2 bg-canvas-3 px-3.5 py-3">
                  {[0, 1, 2].map((d) => (
                    <motion.i key={d} className="h-1.5 w-1.5 bg-muted" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* event log */}
        <div className="border border-line bg-canvas p-3">
          <div className="mb-2 font-mono text-[11px] text-dim">이벤트 로그</div>
          <ol className="space-y-1.5">
            <AnimatePresence initial={false}>
              {logs.map((l, i) => (
                <motion.li
                  key={`${scenario}-log-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                  className="grid grid-cols-[86px_1fr] gap-2 text-[12.5px] leading-[1.55]"
                >
                  <span className="font-mono text-[11.5px] text-dim">{l.actor}</span>
                  <span className={l.tone === "ok" ? "text-ok" : l.tone === "warn" ? "text-warn" : l.tone === "muted" ? "text-muted" : "text-ink-2"}>{t(l.text)}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </div>
      </div>
    </DemoFrame>
  );
}
