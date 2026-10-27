import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Btn, DemoFrame, EASE_OUT } from "@/components/ui";
import { Mark } from "@/components/icons";
import { useNeutral } from "./copy";

type Row = { id: "A" | "B" | "C"; apply: string; consent: string | null; revoke: string | null; note: string };

// Illustrative data shaped like the real response (multiple rows per business).
const ROWS: Row[] = [
  { id: "A", apply: "03-02", consent: "03-05", revoke: "06-30", note: "해임된 이전 수임" },
  { id: "B", apply: "08-01", consent: "08-03", revoke: null, note: "현재 유효한 동의" },
  { id: "C", apply: "09-20", consent: null, revoke: null, note: "동의 대기 중 재신청" },
];

const COLOR: Record<Row["id"], string> = { A: "#d7e2ea", B: "#c27bf0", C: "#ff9a73" };
type Field = "apply" | "consent" | "revoke";
const FIELDS: { key: Field; label: string }[] = [
  { key: "apply", label: "신청일" },
  { key: "consent", label: "동의일" },
  { key: "revoke", label: "해임일" },
];
const NEUTRAL_NOTE: Record<Row["id"], string> = { A: "철회된 이전 동의", B: "현재 유효한 동의", C: "동의 대기 중 재신청" };

function maxOf(field: Field) {
  let best: Row | null = null;
  for (const r of ROWS) {
    const v = r[field];
    if (v && (!best || v > (best[field] as string))) best = r;
  }
  return best;
}

export function AgencyDemo() {
  const [mode, setMode] = useState<"field" | "event">("field");
  const n = useNeutral();

  const picked: Record<Field, Row | null> =
    mode === "field"
      ? { apply: maxOf("apply"), consent: maxOf("consent"), revoke: maxOf("revoke") }
      : (() => {
          const valid = ROWS.find((r) => r.consent && !r.revoke) ?? ROWS.at(-1)!;
          return { apply: valid, consent: valid, revoke: valid };
        })();

  const sources = new Set(Object.values(picked).filter(Boolean).map((r) => r!.id));
  const broken = sources.size > 1;

  return (
    <DemoFrame
      title={n ? "partner-api/consent-history.resolve()" : "hometax/agency-history.resolve()"}
      controls={
        <>
          <Btn active={mode === "field"} onClick={() => setMode("field")}>필드별 최대값</Btn>
          <Btn active={mode === "event"} onClick={() => setMode("event")}>사건 단위 선택</Btn>
        </>
      }
      hint={n ? "같은 대상에 대한 동의 이력 세 건이 외부 API에서 한 번에 돌아온 상황입니다(예시 데이터). 판정 방식을 바꿔 결과 행이 어디서 왔는지 비교해 보세요." : "같은 사업장에 대한 수임 이력 세 건이 한 번에 돌아온 상황입니다(예시 데이터). 판정 방식을 바꿔 결과 행이 어디서 왔는지 비교해 보세요."}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[460px] border-separate border-spacing-0 text-[14px] tabular">
          <thead>
            <tr className="text-left font-mono text-[11.5px] text-dim">
              <th className="pb-2 pr-3 font-normal">건</th>
              {FIELDS.map((f) => (
                <th key={f.key} className="pb-2 pr-3 font-normal">{n && f.key === "revoke" ? "철회일" : f.label}</th>
              ))}
              <th className="pb-2 font-normal">메모</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.id}>
                <td className="border-t border-line py-2.5 pr-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center font-mono text-[12px] font-medium text-canvas" style={{ background: COLOR[r.id] }}>
                    {r.id}
                  </span>
                </td>
                {FIELDS.map((f) => {
                  const on = picked[f.key]?.id === r.id && r[f.key] !== null;
                  return (
                    <td key={f.key} className="border-t border-line py-2.5 pr-3">
                      <span
                        className="relative inline-block px-2 py-1 font-mono transition-colors duration-200"
                        style={{ color: r[f.key] ? "var(--ink)" : "var(--dim)" }}
                      >
                        {on && (
                          <motion.span
                            layoutId={`pick-${f.key}`}
                            className="absolute inset-0"
                            style={{ boxShadow: `inset 0 0 0 1.5px ${COLOR[r.id]}`, background: `${COLOR[r.id]}1f` }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.18 }}
                          />
                        )}
                        <span className="relative">{r[f.key] ?? "—"}</span>
                      </span>
                    </td>
                  );
                })}
                <td className="border-t border-line py-2.5 text-[13px] text-muted">{n ? NEUTRAL_NOTE[r.id] : r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 border border-line bg-canvas p-4">
        <div className="mb-3 font-mono text-[11.5px] text-dim">판정 결과</div>
        <div className="grid grid-cols-3 gap-2">
          {FIELDS.map((f) => {
            const r = picked[f.key];
            const v = r ? r[f.key] : null;
            return (
              <div key={f.key} className="border border-line px-3 py-2.5">
                <div className="text-[12px] text-muted">{n && f.key === "revoke" ? "철회일" : f.label}</div>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={`${mode}-${f.key}`}
                    initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                    transition={{ duration: 0.35, ease: EASE_OUT }}
                    className="mt-1 flex items-center gap-2 font-mono text-[15px]"
                  >
                    {r && <span className="h-2 w-2" style={{ background: COLOR[r.id] }} />}
                    {v ?? "—"}
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={mode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className={`mt-4 flex gap-2 text-[14px] leading-[1.6] ${broken ? "text-alert" : "text-ok"}`}
          >
            <span className="mt-1 shrink-0"><Mark kind={broken ? "fail" : "ok"} size={14} /></span>
            {broken
              ? `세 건에서 값을 하나씩 가져와, 동의일(08-03)이 신청일(09-20)보다 앞서고 이미 ${n ? "철회" : "해임"}된 날짜까지 붙은 ‘존재하지 않는 상태’가 됩니다.`
              : `유효한 동의가 있는 B 건 하나를 고르고 그 행의 날짜를 함께 씁니다. 상태: ${n ? "" : "수임 "}동의 유지.`}
          </motion.p>
        </AnimatePresence>
      </div>
    </DemoFrame>
  );
}
