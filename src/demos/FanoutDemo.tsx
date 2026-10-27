import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Btn, DemoFrame, EASE_OUT } from "@/components/ui";
import { Bell } from "@/components/icons";
import { useNeutral } from "./copy";

type Phase = 0 | 1 | 2 | 3 | 4; // idle, emitted, saved, published, delivered

const INSTANCES = [
  { id: "A", users: ["박회계"], origin: true },
  { id: "B", users: ["이세무", "정대리"], origin: false },
  { id: "C", users: ["김세무"], origin: false },
];
/** Domain-neutral user names for variants B, D, E. */
const NEUTRAL_USERS: Record<string, string> = { 박회계: "user-17", 이세무: "user-42", 정대리: "user-08", 김세무: "user-23" };

export function FanoutDemo() {
  const neutral = useNeutral();
  const who = (u: string) => (neutral ? NEUTRAL_USERS[u] ?? u : u);
  const target = who("김세무");
  const [redis, setRedis] = useState(true);
  const [phase, setPhase] = useState<Phase>(0);
  const timers = useRef<number[]>([]);
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { once: true, amount: 0.6 });

  const fire = () => {
    clear();
    setPhase(0);
    [1, 2, 3, 4].forEach((p, i) => timers.current.push(window.setTimeout(() => setPhase(p as Phase), 120 + i * 650)));
  };

  useEffect(() => {
    if (seen) fire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen]);

  const reached = (inst: (typeof INSTANCES)[number]) => phase >= 4 && (redis || inst.origin);
  const targetOk = phase >= 4 && redis;

  return (
    <DemoFrame
      title="notification/fan-out"
      controls={
        <>
          <Btn active={redis} onClick={() => { clear(); setPhase(0); setRedis(true); }}>Redis Pub/Sub 사용</Btn>
          <Btn active={!redis} onClick={() => { clear(); setPhase(0); setRedis(false); }}>인스턴스 메모리만</Btn>
          <Btn tone="signal" onClick={fire}>{neutral ? "작업 완료 이벤트" : "세금신고 완료 이벤트"}</Btn>
        </>
      }
      hint={`이벤트는 인스턴스 A에서 발생하고, 알림을 받아야 할 ${target}${neutral ? "" : "는"} 인스턴스 C에 SSE로 연결돼 있습니다.`.replace("user-23 인스턴스", "user-23은 인스턴스")}
    >
      {/* top rail */}
      <div ref={box} className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1.5 sm:gap-3">
        <Node on={phase >= 1} label="이벤트 발생" sub="인스턴스 A" />
        <Rail on={phase >= 2} />
        <Node on={phase >= 2} label="이벤트·이력 저장" sub="DB" />
        <Rail on={phase >= 3 && redis} muted={!redis} />
        <Node on={phase >= 3 && redis} label="Redis 채널" sub={redis ? "publish" : "사용 안 함"} muted={!redis} />
      </div>

      {/* fan lines */}
      <div className="relative my-2 h-10">
        <svg viewBox="0 0 300 40" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {[50, 150, 250].map((x, i) => {
            const active = phase >= 4 && (redis || i === 0);
            const from = redis ? 250 : 50;
            return (
              <motion.path
                key={x}
                d={`M ${from} 0 C ${from} 22, ${x} 18, ${x} 40`}
                fill="none"
                stroke={active ? (i === 2 ? "#c27bf0" : "rgba(215,226,234,0.7)") : "rgba(255,255,255,0.12)"}
                strokeWidth="1.4"
                vectorEffect="non-scaling-stroke"
                initial={false}
                animate={{ pathLength: active ? 1 : 0.0001, opacity: active ? 1 : 0.6 }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.08 }}
              />
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {INSTANCES.map((inst) => {
          const got = reached(inst);
          return (
            <div key={inst.id} className={` border p-3 transition-colors duration-300 ${got ? "border-line-2 bg-canvas-3" : "border-line bg-canvas"}`}>
              <div className="mb-2 flex items-center justify-between font-mono text-[11.5px] text-dim">
                <span><span className="hidden sm:inline">인스턴스 </span>{inst.id}</span>
                <span>SSE {inst.users.length}</span>
              </div>
              <ul className="space-y-1.5">
                {inst.users.map((u) => {
                  const isTarget = u === "김세무";
                  return (
                    <li key={u} className="flex items-center justify-between gap-2 text-[13.5px]">
                      <span className={isTarget ? "font-medium text-ink" : "text-ink-2"}>{who(u)}</span>
                      <AnimatePresence>
                        {got && (
                          <motion.span
                            initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
                            animate={{ scale: 1, opacity: 1, rotate: [0, 14, -10, 0] }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                            className={isTarget ? "text-ok" : "text-ink-2"}
                          >
                            <Bell />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-4 min-h-[52px]">
        <AnimatePresence mode="wait">
          {phase >= 4 && (
            <motion.div
              key={String(redis)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              className={` border px-4 py-3 text-[14px] leading-[1.6] ${targetOk ? "border-ok/30 bg-ok/5 text-ink-2" : "border-alert/40 bg-alert/5 text-ink-2"}`}
            >
              {targetOk ? (
                <>{target}에게 SSE 신호 도착, 모바일은 FCM으로 같은 이벤트를 받습니다. 연결 위치와 무관하게 모든 인스턴스가 구독합니다.</>
              ) : (
                <>인스턴스 A의 연결만 신호를 받습니다. {target}{neutral ? "은" : "는"} 새로고침 전까지 모릅니다. 목록은 DB 기준이라 데이터가 사라지진 않지만, ‘실시간’은 깨집니다.</>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DemoFrame>
  );
}

function Node({ on, label, sub, muted }: { on: boolean; label: string; sub: string; muted?: boolean }) {
  return (
    <motion.div
      animate={{ scale: on ? [1, 1.04, 1] : 1 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className={`min-w-0 border px-2.5 py-2 text-center transition-colors duration-300 sm:px-3 ${
        on ? "border-signal/60 bg-signal/10" : muted ? "border-dashed border-line-2 opacity-60" : "border-line bg-canvas"
      }`}
    >
      <div className="truncate text-[12.5px] font-medium text-ink sm:text-[13.5px]">{label}</div>
      <div className="truncate font-mono text-[10.5px] text-dim sm:text-[11px]">{sub}</div>
    </motion.div>
  );
}

function Rail({ on, muted }: { on: boolean; muted?: boolean }) {
  return (
    <div className={`relative h-px w-4 overflow-hidden sm:w-8 ${muted ? "bg-line" : "bg-line-2"}`}>
      <motion.div className="absolute inset-0 origin-left bg-signal" initial={false} animate={{ scaleX: on ? 1 : 0 }} transition={{ duration: 0.45, ease: EASE_OUT }} />
    </div>
  );
}
