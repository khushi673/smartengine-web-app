"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneFrame } from "@/components/ui/DeviceFrame";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { useTenantTheme } from "@/components/shell/TenantThemeContext";
import { useApplicantDraft } from "@/components/shell/ApplicantDraftContext";

type Identity = "unset" | "new" | "existing";
type VerifyState = "idle" | "checking" | "found" | "not_found";

const OPTIONS: { value: Identity; title: string; sub: string; icon: string }[] = [
  { value: "new", title: "I'm new here", sub: "I don't have an account with this bank yet", icon: "🆕" },
  { value: "existing", title: "I'm an existing customer", sub: "I already have an account with this bank", icon: "🏦" },
];

export default function IdentityPage() {
  const { tenant } = useTenantTheme();
  const router = useRouter();
  const { setIsExistingCustomer } = useApplicantDraft();

  const [identity, setIdentity] = useState<Identity>("unset");
  const [accountNumber, setAccountNumber] = useState("");
  const [verify, setVerify] = useState<VerifyState>("idle");

  const choose = (value: Identity) => {
    setIdentity(value);
    setVerify("idle");
    setIsExistingCustomer(false);
  };

  const runVerify = (outcome: "found" | "not_found") => {
    if (!accountNumber.trim()) return;
    setVerify("checking");
    setTimeout(() => {
      setVerify(outcome);
      setIsExistingCustomer(outcome === "found");
    }, 700);
  };

  const canContinue = identity === "new" || (identity === "existing" && verify === "found");

  return (
    <PhoneFrame tenant={tenant}>
      <div className="flex flex-col gap-1">
        <span className="text-[10.5px] font-bold tracking-wide text-[var(--t-primary,var(--brand))] uppercase">Before we begin</span>
        <h1 className="text-[19px]">Have you banked with {tenant === "meridian" ? "Meridian Bank" : "Oblavo"} before?</h1>
        <p className="text-[12.5px] text-[var(--t-muted,var(--muted))]">This just helps us tailor the next few steps for you.</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => choose(opt.value)}
            className={`flex items-center gap-3 rounded-[12px] border-[1.5px] p-3.5 text-left transition-colors ${
              identity === opt.value
                ? "border-[var(--t-primary,var(--brand))] bg-[var(--t-wash,var(--brand-wash))]"
                : "border-[var(--border-strong)] bg-[var(--t-surface,var(--surface-2))]"
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--t-surface,var(--surface))] text-[16px]">
              {opt.icon}
            </span>
            <span className="flex flex-col gap-0.5">
              <span
                className={`text-[13.5px] font-bold ${
                  identity === opt.value ? "text-[var(--t-primary,var(--brand))]" : "text-[var(--t-ink-strong,var(--ink-strong))]"
                }`}
              >
                {opt.title}
              </span>
              <span className="text-[11.5px] text-[var(--t-muted,var(--muted))]">{opt.sub}</span>
            </span>
          </button>
        ))}
      </div>

      {identity === "existing" && (
        <Card flat className="flex flex-col gap-3">
          {verify !== "found" ? (
            <>
              <Field label="Bank account number" hint="We'll use this to look up your existing relationship and pre-fill your details.">
                <Input
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value);
                    setVerify("idle");
                  }}
                  placeholder="e.g. 013 245 678 901"
                />
              </Field>

              {verify === "checking" && (
                <span className="text-[12.5px] text-[var(--t-muted,var(--muted))]">Checking our records…</span>
              )}

              {verify === "not_found" && (
                <div className="flex flex-col gap-2 rounded-md bg-[var(--warning-bg)] p-2.5">
                  <span className="text-[12px] text-[var(--warning-text)]">We couldn&apos;t find an account with that number.</span>
                  <Button size="sm" variant="secondary" onClick={() => choose("new")}>
                    Continue as a new applicant instead
                  </Button>
                </div>
              )}

              {verify !== "checking" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => runVerify("found")} disabled={!accountNumber.trim()}>
                    Verify account
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => runVerify("not_found")} disabled={!accountNumber.trim()}>
                    Simulate: not found
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-[var(--success-solid)] text-white">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-[12.5px] text-[var(--success-text)]">
                Account verified — welcome back. We&apos;ll pre-fill what we already have on file so you only need to review and confirm
                it.
              </span>
            </div>
          )}
        </Card>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-2">
        <div className="flex gap-2.5">
          <Button variant="secondary" onClick={() => router.push("/applicant")}>
            Back
          </Button>
          <Button className="flex-1" disabled={!canContinue} onClick={() => router.push("/applicant/consent")}>
            Continue
          </Button>
        </div>
        {!canContinue && (
          <span className="text-center text-[11.5px] text-[var(--t-muted,var(--muted))]">
            {identity === "unset" ? "Choose an option above to continue." : "Verify your account number to continue."}
          </span>
        )}
      </div>
    </PhoneFrame>
  );
}
