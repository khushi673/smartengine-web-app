"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneFrame } from "@/components/ui/DeviceFrame";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TenantHeader, tenantLabel } from "@/components/applicant/TenantHeader";
import { useTenantTheme } from "@/components/shell/TenantThemeContext";
import { useApplicantDraft } from "@/components/shell/ApplicantDraftContext";
import { Field, Input } from "@/components/ui/Field";

const checklist = ["Trade licence", "Signatory Emirates ID", "VAT certificate (if registered)"];

type Identity = "unset" | "new" | "existing";
type VerifyState = "idle" | "checking" | "found" | "not_found";

export default function InvitationPage() {
  const [expired, setExpired] = useState(false);
  const { tenant } = useTenantTheme();
  const router = useRouter();
  const { isExistingCustomer, setIsExistingCustomer } = useApplicantDraft();

  const [identity, setIdentity] = useState<Identity>("unset");
  const [accountNumber, setAccountNumber] = useState("");
  const [verify, setVerify] = useState<VerifyState>("idle");

  const chooseNew = () => {
    setIdentity("new");
    setVerify("idle");
    setIsExistingCustomer(false);
  };

  const chooseExisting = () => {
    setIdentity("existing");
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

  const canStart = identity === "new" || (identity === "existing" && verify === "found");

  return (
    <PhoneFrame tenant={tenant}>
      <TenantHeader />

      {!expired ? (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10.5px] font-bold tracking-wide text-[var(--t-primary,var(--brand))] uppercase">
              Merchant onboarding
            </span>
            <h1 className="text-[22px] leading-tight">You&apos;re invited to complete your merchant application</h1>
            <p className="text-[13px] text-[var(--t-muted,var(--muted))]">
              This link was sent to you by {tenantLabel(tenant)}. It&apos;s secure and unique to your business.
            </p>
          </div>

          <Card flat className="flex flex-col gap-3">
            <span className="text-[13px] font-bold text-[var(--t-ink-strong,var(--ink-strong))]">
              Have you banked with {tenant === "meridian" ? "Meridian Bank" : "Oblavo"} before?
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={chooseNew}
                className={`flex-1 rounded-lg border-[1.5px] px-3 py-2.5 text-[12.5px] font-semibold ${
                  identity === "new"
                    ? "border-[var(--t-primary,var(--brand))] bg-[var(--t-wash,var(--brand-wash))] text-[var(--t-primary,var(--brand))]"
                    : "border-[var(--border-strong)] bg-[var(--t-surface,var(--surface-2))] text-[var(--t-ink,var(--ink))]"
                }`}
              >
                No, I&apos;m new here
              </button>
              <button
                type="button"
                onClick={chooseExisting}
                className={`flex-1 rounded-lg border-[1.5px] px-3 py-2.5 text-[12.5px] font-semibold ${
                  identity === "existing"
                    ? "border-[var(--t-primary,var(--brand))] bg-[var(--t-wash,var(--brand-wash))] text-[var(--t-primary,var(--brand))]"
                    : "border-[var(--border-strong)] bg-[var(--t-surface,var(--surface-2))] text-[var(--t-ink,var(--ink))]"
                }`}
              >
                Yes, existing customer
              </button>
            </div>

            {identity === "existing" && verify !== "found" && (
              <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-3">
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
                    <span className="text-[12px] text-[var(--warning-text)]">
                      We couldn&apos;t find an account with that number.
                    </span>
                    <Button size="sm" variant="secondary" onClick={chooseNew}>
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
              </div>
            )}

            {identity === "existing" && verify === "found" && (
              <div className="flex items-center gap-2.5 rounded-md bg-[var(--success-bg)] p-2.5">
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

          <Card flat className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[var(--t-ink-strong,var(--ink-strong))]">What you&apos;ll need</span>
              <Badge tone="info">~{isExistingCustomer ? "8–10" : "12–15"} min</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {checklist.map((item) => (
                <div key={item} className="flex items-center gap-2 text-[13px] text-[var(--t-ink,var(--ink))]">
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3 8l3 3 7-7" stroke="var(--success-solid)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <p className="text-[13px] text-[var(--t-muted,var(--muted))]">
            Your progress is saved automatically — you can leave and return using this same link at any time.
          </p>

          <Button block disabled={!canStart} onClick={() => router.push("/applicant/consent")}>
            Start application
          </Button>
          {!canStart && (
            <span className="text-center text-[11.5px] text-[var(--t-muted,var(--muted))]">
              {identity === "unset" ? "Answer the question above to continue." : "Verify your account number to continue."}
            </span>
          )}

          <div className="mt-2 flex flex-col gap-1.5 rounded-[10px] border border-dashed border-[var(--border-strong)] p-3">
            <span className="text-[10.5px] font-bold tracking-wide text-[var(--t-muted,var(--muted))] uppercase">Demo controls</span>
            <Button block variant="ghost" onClick={() => setExpired(true)}>
              Preview: expired link state
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2.5 pt-10 text-center">
          <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[var(--warning-bg)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v5M12 16h.01" stroke="var(--warning-text)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="var(--warning-text)" strokeWidth="1.6" />
            </svg>
          </div>
          <h1 className="text-[19px]">This invitation link has expired</h1>
          <p className="text-[13px] text-[var(--t-muted,var(--muted))]">
            For your security, invitation links expire after 14 days. No application data is shown until a new link is issued.
          </p>
          <Button variant="secondary" onClick={() => setExpired(false)}>
            Back to valid preview
          </Button>
          <span className="text-[13px] text-[var(--t-muted,var(--muted))]">
            Need a new link? Contact your {tenant === "meridian" ? "Meridian Bank" : "Oblavo"} relationship manager.
          </span>
        </div>
      )}
    </PhoneFrame>
  );
}
