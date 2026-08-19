"use client";

import { useRouter } from "next/navigation";
import { PhoneFrame } from "@/components/ui/DeviceFrame";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTenantTheme } from "@/components/shell/TenantThemeContext";

const timeline = [
  { label: "Submitted", hint: "14 Aug 2026, 10:42", done: true },
  { label: "Operations review", hint: "Typically within 1–2 business days", done: false, active: true },
  { label: "Possible information request", hint: "Only if something needs clarifying", done: false },
  { label: "Handoff to bank", hint: "Final decision made by the bank", done: false },
];

export default function ConfirmationPage() {
  const { tenant } = useTenantTheme();
  const router = useRouter();

  return (
    <PhoneFrame tenant={tenant}>
      <div className="flex flex-col items-center gap-2.5 pt-14 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success-bg)]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M4 12l5 5 11-11" stroke="var(--success-text)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-[20px]">Application submitted</h1>
        <p className="text-[12.5px] text-[var(--t-muted,var(--muted))]">Your reference number</p>
        <div className="font-display text-xl font-extrabold tracking-wide text-[var(--t-ink-strong,var(--ink-strong))] tabular-nums">SE-2026-081402</div>

        <Card flat className="mt-3 w-full text-left">
          <div className="flex flex-col gap-3.5">
            {timeline.map((t) => (
              <div key={t.label} className="flex gap-2.5">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    t.done ? "bg-[var(--success-solid)]" : t.active ? "bg-[var(--brand)]" : "bg-[var(--border)]"
                  }`}
                />
                <div>
                  <strong className="text-[13px] text-[var(--t-ink-strong,var(--ink-strong))]">{t.label}</strong>
                  <div className="text-[11px] text-[var(--t-muted,var(--muted))]">{t.hint}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Button block variant="secondary" className="mt-2" onClick={() => router.push("/applicant")}>
          Restart demo flow
        </Button>
      </div>
    </PhoneFrame>
  );
}
