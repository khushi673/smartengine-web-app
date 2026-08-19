"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneFrame } from "@/components/ui/DeviceFrame";
import { Button } from "@/components/ui/Button";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { Badge, Tone } from "@/components/ui/Badge";
import { useTenantTheme } from "@/components/shell/TenantThemeContext";

const STEPS = [
  { title: "Trade licence — checking file quality", sub: "Resolution, orientation, completeness" },
  { title: "Trade licence — classifying & extracting fields", sub: "Matched against expected document type" },
  { title: "Emirates ID — extracting fields", sub: "Name, ID number, expiry" },
  { title: "Cross-checking against entered data", sub: "Comparing extracted vs. typed values" },
];

interface FieldRow {
  field: string;
  entered: string;
  read: string;
  match: boolean;
}

const TRADE_LICENCE_FIELDS: FieldRow[] = [
  { field: "Legal name", entered: "Al Noor Trading LLC", read: "Al Noor Trading LLC", match: true },
  { field: "Licence no.", entered: "774521", read: "774521", match: true },
  { field: "Expiry date", entered: "12 Mar 2027", read: "12 Mar 2027", match: true },
];

const EMIRATES_ID_FIELDS: FieldRow[] = [
  { field: "Name", entered: "Fatima Al Suwaidi", read: "Fatima Al Suwaidi", match: true },
  { field: "ID number", entered: "784-1990-1234567-1", read: "784-1990-1234567-1", match: true },
  { field: "Expiry date", entered: "04 Jun 2028", read: "04 Jun 2027", match: false },
];

export default function ProcessingPage() {
  const [completed, setCompleted] = useState(0);
  const { tenant } = useTenantTheme();
  const router = useRouter();
  const done = completed >= STEPS.length;

  useEffect(() => {
    if (completed >= STEPS.length) return;
    const timer = setTimeout(() => setCompleted((c) => c + 1), 650);
    return () => clearTimeout(timer);
  }, [completed]);

  return (
    <PhoneFrame tenant={tenant}>
      <div className="flex flex-col gap-1">
        <span className="text-[10.5px] font-bold tracking-wide text-[var(--t-primary,var(--brand))] uppercase">Step 5 of 6</span>
        <h1 className="text-[19px]">{done ? "Here's what we found" : "Processing your documents…"}</h1>
      </div>
      <ProgressSteps total={6} current={5} />

      {!done && (
        <div className="flex flex-col gap-2.5">
          {STEPS.map((s, i) => {
            const state = i < completed ? "complete" : i === completed ? "active" : "pending";
            return (
              <div
                key={s.title}
                className={`flex items-center gap-3 rounded-[10px] border p-3 transition-opacity ${
                  state === "pending" ? "opacity-40" : "opacity-100"
                } ${state === "active" ? "border-[var(--t-primary,var(--brand))] bg-[var(--t-wash,var(--brand-wash))]" : "border-[var(--border)]"}`}
              >
                {state === "complete" ? (
                  <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[var(--success-solid)] text-white">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                ) : (
                  <span
                    className={`h-4.5 w-4.5 shrink-0 rounded-full border-2 border-[var(--border-strong)] ${
                      state === "active" ? "animate-spin border-t-[var(--t-primary,var(--brand))]" : ""
                    }`}
                  />
                )}
                <div>
                  <div className="text-[12.5px] font-bold text-[var(--t-ink-strong,var(--ink-strong))]">{s.title}</div>
                  <div className="text-[11px] text-[var(--t-muted,var(--muted))]">{s.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {done && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <DocResultRow name="Trade licence" sub="3 of 3 fields matched" tone="success" label="Verified" />
            <DocResultRow name="Emirates ID (signatory)" sub="2 of 3 fields matched" tone="warning" label="Attention required" />
            <DocResultRow name="VAT certificate" sub="Not submitted" tone="info" label="Bank review required" />
          </div>

          <ExtractTable title="Trade licence — extracted & compared" rows={TRADE_LICENCE_FIELDS} />
          <ExtractTable title="Emirates ID — extracted & compared" rows={EMIRATES_ID_FIELDS} />
        </div>
      )}

      <div className="mt-auto flex gap-2.5 pt-2">
        <Button variant="secondary" onClick={() => router.push("/applicant/documents")}>
          Back
        </Button>
        <Button className="flex-1" disabled={!done} onClick={() => router.push("/applicant/review")}>
          {done ? "Continue to review" : "Processing…"}
        </Button>
      </div>
    </PhoneFrame>
  );
}

function DocResultRow({ name, sub, tone, label }: { name: string; sub: string; tone: Tone; label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[10px] border border-[var(--border)] bg-[var(--t-surface,var(--surface-2))] p-3">
      <div className="flex-1">
        <div className="text-[13px] font-bold text-[var(--t-ink-strong,var(--ink-strong))]">{name}</div>
        <div className="text-[11px] text-[var(--t-muted,var(--muted))]">{sub}</div>
      </div>
      <Badge tone={tone} dot>
        {label}
      </Badge>
    </div>
  );
}

function ExtractTable({ title, rows }: { title: string; rows: FieldRow[] }) {
  const matchedCount = rows.filter((r) => r.match).length;
  return (
    <div className="rounded-[10px] border border-[var(--border)] p-3.5">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <strong className="text-[12.5px] text-[var(--t-ink-strong,var(--ink-strong))]">{title}</strong>
        <Badge tone={matchedCount === rows.length ? "success" : "warning"}>
          {matchedCount} of {rows.length} matched
        </Badge>
      </div>
      <table className="w-full border-collapse text-[11.5px]">
        <thead>
          <tr className="text-[var(--t-muted,var(--muted))]">
            <th className="pb-1.5 text-left font-bold">Field</th>
            <th className="pb-1.5 text-left font-bold">You entered</th>
            <th className="pb-1.5 text-left font-bold">SmartEngine read</th>
            <th className="pb-1.5 text-left font-bold" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.field} className="border-t border-[var(--border)] text-[var(--t-ink,var(--ink))]">
              <td className="py-1.5">{r.field}</td>
              <td className="py-1.5">{r.entered}</td>
              <td className="py-1.5">{r.read}</td>
              <td className={`py-1.5 text-right font-bold ${r.match ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"}`}>
                {r.match ? "Match" : "Mismatch"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
