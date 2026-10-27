import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Btn, DemoFrame, EASE_OUT } from "@/components/ui";
import { useNeutral } from "./copy";
import { Mark } from "@/components/icons";

const LAYERS = [
  { name: "DNS 위임", detail: "ACME 전용 child zone을 만들고 상위 zone에서 위임" },
  { name: "인증서 발급", detail: "DNS-01 · staging 먼저, 체인과 키 검증 후 production" },
  { name: "인증서 등록", detail: "NCP Certificate Manager" },
  { name: "NACL · 출발지", detail: "TCP 443 허용, GCP 고정 NAT IP만 allowlist" },
  { name: "LB HTTPS 리스너", detail: "TLS 1.2+ 종료, 기존 대상 그룹 재사용 · HTTP 80 유지" },
  { name: "런타임 설정", detail: "GitOps ConfigMap의 endpoint 환경변수" },
  { name: "Pod 내부 호출", detail: "production Pod 안에서 실제 요청 확인" },
];

type S = "idle" | "run" | "ok" | "fail";

export function HttpsDemo() {
  const neutral = useNeutral();
  const [st, setSt] = useState<S[]>(LAYERS.map(() => "idle"));
  const [envHttps, setEnvHttps] = useState(false);
  const [phase, setPhase] = useState<"idle" | "running" | "found" | "fixed">("idle");
  const timers = useRef<number[]>([]);
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  const run = (fixedEnv: boolean) => {
    clear();
    setPhase("running");
    setSt(LAYERS.map(() => "idle"));
    LAYERS.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setSt((p) => p.map((v, j) => (j === i ? "run" : v))), i * 520));
      timers.current.push(
        window.setTimeout(() => {
          // Without the ConfigMap change, the in-pod check is the one that catches it.
          const fail = !fixedEnv && i === LAYERS.length - 1;
          setSt((p) => p.map((v, j) => (j === i ? (fail ? "fail" : "ok") : v)));
          if (i === LAYERS.length - 1) setPhase(fail ? "found" : "fixed");
        }, i * 520 + 420),
      );
    });
  };

  const fix = () => {
    setEnvHttps(true);
    run(true);
  };

  const reset = () => {
    clear();
    setEnvHttps(false);
    setPhase("idle");
    setSt(LAYERS.map(() => "idle"));
  };

  return (
    <DemoFrame
      title={neutral ? "cutover: gke → ncp-private (https)" : "cutover: gke → ncp-financial (https)"}
      controls={
        <>
          {phase === "idle" && <Btn tone="signal" onClick={() => run(envHttps)}>전환 실행</Btn>}
          {phase === "found" && <Btn tone="signal" onClick={fix}>ConfigMap 전환 후 재검증</Btn>}
          {phase !== "idle" && phase !== "running" && <Btn onClick={reset}>처음부터</Btn>}
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,240px)]">
        <ol className="space-y-1.5">
          {LAYERS.map((l, i) => (
            <li
              key={l.name}
              className={`grid grid-cols-[22px_1fr_auto] items-center gap-3 border px-3 py-2.5 transition-colors duration-300 ${
                st[i] === "fail" ? "border-alert/60 bg-alert/10" : st[i] === "ok" ? "border-line bg-canvas" : st[i] === "run" ? "border-line-2 bg-canvas-3" : "border-line"
              }`}
            >
              <span className="font-mono text-[11px] text-dim">{i + 1}</span>
              <div className="min-w-0">
                <div className="text-[14px] font-medium">{l.name}</div>
                <div className="text-[12.5px] leading-[1.5] text-muted">{l.detail}</div>
              </div>
              <span className={`flex h-5 w-5 items-center justify-center ${st[i] === "ok" ? "text-ok" : st[i] === "fail" ? "text-alert" : "text-dim"}`}>
                {st[i] === "ok" && <Mark kind="ok" size={14} />}
                {st[i] === "fail" && <Mark kind="fail" size={14} />}
                {st[i] === "run" && <span className="h-1.5 w-1.5 animate-pulse bg-ink" />}
              </span>
            </li>
          ))}
        </ol>

        <div className="space-y-3">
          <div className="font-mono text-[11.5px] text-dim">설정 우선순위</div>
          <Precedence label="애플리케이션 기본값" value="https://engine…" winner={false} note="코드에서는 이미 바꿨음" />
          <Precedence
            label="ConfigMap 환경변수"
            value={envHttps ? "https://engine…" : "http://engine…"}
            winner
            note="실제로 Pod가 쓰는 값"
            bad={!envHttps}
          />
          <div className="border border-dashed border-line-2 p-3 text-[12.5px] leading-[1.6] text-muted">
            HTTP 80 리스너·대상 그룹은 그대로 둡니다. 롤백은 endpoint 한 줄을 되돌리는 것으로 끝납니다.
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {(phase === "found" || phase === "fixed") && (
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className={`mt-5 border px-4 py-3 text-[14px] leading-[1.6] ${phase === "found" ? "border-alert/40 bg-alert/5" : "border-ok/30 bg-ok/5"}`}
          >
            {phase === "found"
              ? "인프라 여섯 계층은 모두 통과했는데 Pod는 여전히 http://를 호출합니다. 환경변수가 코드 기본값을 덮어쓰고 있었습니다. 외부 endpoint 검증만 했다면 놓쳤을 문제입니다."
              : "Pod 안에서 HTTPS 호출 확인. 백엔드 코드 수정 없이 외부 통신 구간이 암호화됐습니다."}
          </motion.p>
        )}
      </AnimatePresence>
    </DemoFrame>
  );
}

function Precedence({ label, value, winner, note, bad }: { label: string; value: string; winner: boolean; note: string; bad?: boolean }) {
  return (
    <div className={` border p-3 ${winner ? (bad ? "border-alert/50" : "border-ok/50") : "border-line opacity-70"}`}>
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="text-ink-2">{label}</span>
        {winner && <span className="font-mono text-[10.5px] text-dim">우선</span>}
      </div>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className={`mt-1 font-mono text-[13px] ${winner ? (bad ? "text-alert" : "text-ok") : "text-muted line-through decoration-dim"}`}
        >
          {value}
        </motion.div>
      </AnimatePresence>
      <div className="mt-1 text-[11.5px] text-dim">{note}</div>
    </div>
  );
}
